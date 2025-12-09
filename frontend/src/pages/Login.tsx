import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { TextField, Button, Box, Link, Typography, Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FormLayout from '../components/common/FormLayout';
import { ROUTES } from '../constants/routes';
import { loginSchema, type LoginFormData } from '../lib/validations';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [inviteInfo, setInviteInfo] = useState<{ email?: string; organization_name?: string; role?: string } | null>(null);

  // Check for invite token in URL or localStorage
  useEffect(() => {
    const inviteToken = searchParams.get('invite_token') || localStorage.getItem('invite_token');
    const storedInviteInfo = localStorage.getItem('invite_info');
    
    if (inviteToken && storedInviteInfo) {
      try {
        const info = JSON.parse(storedInviteInfo);
        setInviteInfo(info);
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Get invite token from URL or localStorage
      const inviteToken = searchParams.get('invite_token') || localStorage.getItem('invite_token');
      
      // Include invite token in login if present
      const loginData = inviteToken ? { ...data, invite_token: inviteToken } : data;
      
      const response = await login(loginData.username, loginData.password, loginData.invite_token);
      
      // Clear invite token from localStorage
      if (inviteToken) {
        localStorage.removeItem('invite_token');
        localStorage.removeItem('invite_info');
      }
      
      // After login, check if invitation was accepted
      if (response.invitation_accepted && response.organization_id) {
        // Redirect to organization detail page
        navigate(ROUTES.ORGANIZATION_DETAIL(response.organization_id));
      } else {
        // Normal flow: redirect to dashboard
        navigate(ROUTES.DASHBOARD);
      }
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.error || 'Failed to log in. Please check your credentials.',
      });
    }
  };

  return (
    <FormLayout
      title={inviteInfo ? `Join ${inviteInfo.organization_name}` : "Welcome Back"}
      subtitle={inviteInfo ? `You've been invited as a ${inviteInfo.role}` : "Sign in to continue to your dashboard"}
      error={errors.root?.message}
    >
      {inviteInfo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You've been invited to join <strong>{inviteInfo.organization_name}</strong> as a <strong>{inviteInfo.role}</strong>.
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
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
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
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to={ROUTES.SIGNUP}
              sx={{
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </FormLayout>
  );
};

export default Login;
