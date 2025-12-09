import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { TextField, Button, Box, Link, Typography, Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FormLayout from '../components/common/FormLayout';
import { ROUTES } from '../constants/routes';
import { signupSchema, type SignupFormData } from '../lib/validations';
import { motion } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser } = useAuth();
  const [inviteInfo, setInviteInfo] = useState<{ email?: string; organization_name?: string; role?: string } | null>(null);

  // Check for invite token in URL or localStorage
  useEffect(() => {
    const inviteToken = searchParams.get('invite_token') || localStorage.getItem('invite_token');
    const storedInviteInfo = localStorage.getItem('invite_info');
    
    if (inviteToken && storedInviteInfo) {
      try {
        const info = JSON.parse(storedInviteInfo);
        setInviteInfo(info);
        // Pre-fill email if available
        if (info.email) {
          // Note: We can't directly set form values here, but we can show a message
        }
      } catch (e) {
        // Invalid stored info
      }
    }
  }, [searchParams]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: inviteInfo?.email || '',
      password: '',
      password2: '',
      first_name: '',
      last_name: '',
    },
  });

  // Update email field when invite info is loaded
  useEffect(() => {
    if (inviteInfo?.email) {
      setValue('email', inviteInfo.email);
    }
  }, [inviteInfo, setValue]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Get invite token from URL or localStorage
      const inviteToken = searchParams.get('invite_token') || localStorage.getItem('invite_token');
      
      // Include invite token in registration if present
      const registerData = inviteToken ? { ...data, invite_token: inviteToken } : data;
      
      const response = await registerUser(registerData as any);
      
      // Clear invite token from localStorage
      if (inviteToken) {
        localStorage.removeItem('invite_token');
        localStorage.removeItem('invite_info');
      }
      
      // After signup, check if invitation was accepted
      if (response.invitation_accepted && response.organization_id) {
        // Redirect to organization detail page
        navigate(ROUTES.ORGANIZATION_DETAIL(response.organization_id));
      } else {
        // Normal flow: redirect to create organization (onboarding flow)
        navigate(ROUTES.CREATE_ORGANIZATION);
      }
    } catch (error: any) {
      // Handle API errors
      const apiError = error.response?.data;
      if (apiError) {
        // Set field-specific errors
        if (apiError.username) {
          setError('username', { message: Array.isArray(apiError.username) ? apiError.username[0] : apiError.username });
        }
        if (apiError.email) {
          setError('email', { message: Array.isArray(apiError.email) ? apiError.email[0] : apiError.email });
        }
        if (apiError.password) {
          setError('password', { message: Array.isArray(apiError.password) ? apiError.password[0] : apiError.password });
        }
        if (apiError.non_field_errors) {
          setError('root', { message: Array.isArray(apiError.non_field_errors) ? apiError.non_field_errors[0] : apiError.non_field_errors });
        }
      } else {
        setError('root', { message: 'Failed to sign up. Please try again.' });
      }
    }
  };

  return (
    <FormLayout
      title={inviteInfo ? `Join ${inviteInfo.organization_name}` : "Create Your Account"}
      subtitle={inviteInfo ? `You've been invited as a ${inviteInfo.role}` : "Get started with URL shortening in seconds"}
      error={errors.root?.message}
    >
      {inviteInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You've been invited to join <strong>{inviteInfo.organization_name}</strong> as a <strong>{inviteInfo.role}</strong>.
          {inviteInfo.email && ` Please use the email ${inviteInfo.email} to sign up.`}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
      >
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              margin="dense"
              required
              fullWidth
              label="Username"
              autoComplete="username"
              autoFocus
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              margin="dense"
              required
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
          )}
        />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                margin="dense"
                fullWidth
                label="First Name"
                autoComplete="given-name"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
            )}
          />

          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                margin="dense"
                fullWidth
                label="Last Name"
                autoComplete="family-name"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
            )}
          />
        </Box>

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              margin="dense"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message || 'At least 8 characters with uppercase, lowercase, and number'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
          )}
        />

        <Controller
          name="password2"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              margin="dense"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={!!errors.password2}
              helperText={errors.password2?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
          )}
        />

        <Button
          component={motion.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          fullWidth
          variant="contained"
          size="medium"
          disabled={isSubmitting}
          sx={{
            mt: 2,
            mb: 1,
            py: 1,
            borderRadius: 1.5,
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          }}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to={ROUTES.LOGIN}
              sx={{
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </FormLayout>
  );
};

export default Signup;
