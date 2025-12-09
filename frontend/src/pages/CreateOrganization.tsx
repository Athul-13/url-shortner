import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateOrganization } from '../hooks/queries/organizations';
import FormLayout from '../components/common/FormLayout';
import { ROUTES } from '../constants/routes';
import { organizationSchema, type OrganizationFormData } from '../lib/validations';
import { motion } from 'framer-motion';

const CreateOrganization = () => {
  const navigate = useNavigate();
  const createOrganization = useCreateOrganization();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      await createOrganization.mutateAsync(data);
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || error.response?.data?.error || 'Failed to create organization. Please try again.',
      });
    }
  };

  return (
    <FormLayout
      title="Create Your Organization"
      subtitle="Let's set up your workspace to get started"
      error={errors.root?.message}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              margin="dense"
              required
              fullWidth
              label="Organization Name"
              autoFocus
              error={!!errors.name}
              helperText={errors.name?.message || 'This will be your workspace name'}
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
          {isSubmitting ? 'Creating...' : 'Create Organization'}
        </Button>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1.5 }}>
          You can create more organizations later from your dashboard
        </Typography>
      </Box>
    </FormLayout>
  );
};

export default CreateOrganization;
