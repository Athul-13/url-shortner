import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Folder as FolderIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrganization } from '../hooks/queries/organizations';
import { useNamespaces } from '../hooks/queries/namespaces';
import { useCreateShortURL } from '../hooks/queries/urls';
import { shortURLSchema, type ShortURLFormData } from '../lib/validations';
import { ROUTES } from '../constants/routes';
import ShortenedURLsList from '../components/ShortenedURLsList';

const OrganizationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const organizationId = id ? parseInt(id, 10) : 0;

  const { data: organization, isLoading: orgLoading, error: orgError } = useOrganization(organizationId);
  const { data: namespaces, isLoading: namespacesLoading } = useNamespaces(organizationId);
  const createShortURL = useCreateShortURL();

  const [openModal, setOpenModal] = useState(false);

  const isAdmin = organization?.user_role === 'ADMIN';
  const isEditor = organization?.user_role === 'EDITOR';
  const canCreateURL = isAdmin || isEditor;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<ShortURLFormData>({
    resolver: zodResolver(shortURLSchema),
    mode: 'onChange',
    defaultValues: {
      original_url: '',
      namespace: 0,
      short_code: '',
    },
  });

  const handleOpenModal = () => {
    reset({
      original_url: '',
      namespace: namespaces && namespaces.length > 0 ? namespaces[0].id : 0,
      short_code: '',
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    reset();
  };

  const onSubmit = async (data: ShortURLFormData) => {
    try {
      const submitData = {
        original_url: data.original_url,
        namespace: data.namespace,
        ...(data.short_code && data.short_code.trim() !== '' ? { short_code: data.short_code } : {}),
      };
      await createShortURL.mutateAsync(submitData);
      handleCloseModal();
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { error?: string; message?: string; short_code?: string[] } } })?.response?.data?.error ||
        (error as { response?: { data?: { error?: string; message?: string; short_code?: string[] } } })?.response?.data?.message ||
        (error as { response?: { data?: { error?: string; message?: string; short_code?: string[] } } })?.response?.data?.short_code?.[0] ||
        (error as { message?: string })?.message ||
        'An error occurred. Please try again.';
      setError('root', { message: errorMessage });
    }
  };

  if (orgLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (orgError || !organization) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="error">Failed to load organization. Please try again.</Alert>
            <Button onClick={() => navigate(ROUTES.DASHBOARD)} sx={{ mt: 2 }}>
              Back to Dashboard
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              background: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate(ROUTES.DASHBOARD)} size="small">
                  <ArrowBackIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                      {organization.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={organization.user_role || 'VIEWER'}
                        size="small"
                        color={
                          organization.user_role === 'ADMIN'
                            ? 'primary'
                            : organization.user_role === 'EDITOR'
                            ? 'success'
                            : 'default'
                        }
                        sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {organization.members?.length || 0} member{organization.members?.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {canCreateURL && (
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="contained"
                  startIcon={<LinkIcon />}
                  onClick={handleOpenModal}
                  sx={{
                    borderRadius: 1.5,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    },
                  }}
                >
                  Create Short URL
                </Button>
              )}
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Created: {new Date(organization.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Namespace Management Section - Only for Admins */}
        {isAdmin && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Paper
              elevation={8}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'white',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FolderIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Namespaces
                  </Typography>
                </Box>
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="contained"
                  startIcon={<FolderIcon />}
                  onClick={() => navigate(ROUTES.NAMESPACES, { state: { organizationId: organization.id } })}
                  sx={{
                    borderRadius: 1.5,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    },
                  }}
                >
                  Manage Namespaces
                </Button>
              </Box>

              {namespacesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : namespaces && namespaces.length > 0 ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {namespaces.length} namespace{namespaces.length !== 1 ? 's' : ''} in this organization
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                      },
                      gap: 2,
                    }}
                  >
                    {namespaces.slice(0, 6).map((namespace) => (
                      <Paper
                        key={namespace.id}
                        component={motion.div}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {namespace.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created {new Date(namespace.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                  {namespaces.length > 6 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(ROUTES.NAMESPACES, { state: { organizationId: organization.id } })}
                        sx={{ textTransform: 'none' }}
                      >
                        View All {namespaces.length} Namespaces
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    No namespaces yet. Create your first namespace to get started.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<FolderIcon />}
                    onClick={() => navigate(ROUTES.NAMESPACES, { state: { organizationId: organization.id } })}
                    sx={{
                      borderRadius: 1.5,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      },
                    }}
                  >
                    Create Namespace
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* Info for non-admins */}
        {!isAdmin && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            sx={{ mb: 3 }}
          >
            <Paper
              elevation={8}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'white',
                textAlign: 'center',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                You are a {organization.user_role || 'VIEWER'} in this organization. Namespace management is only
                available to administrators.
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Shortened URLs Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          sx={{ mt: 3 }}
        >
          <ShortenedURLsList
            organizationId={organizationId}
            namespaces={namespaces || []}
            userRole={organization.user_role || 'VIEWER'}
          />
        </Box>

        {/* Create Short URL Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle sx={{ fontWeight: 600 }}>Create Short URL</DialogTitle>
            <DialogContent>
              {errors.root && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.root.message}
                </Alert>
              )}

              {namespaces && namespaces.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No namespaces available. Please create a namespace first.
                </Alert>
              ) : null}

              <Controller
                name="original_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="URL to Shorten"
                    fullWidth
                    margin="normal"
                    error={!!errors.original_url}
                    helperText={errors.original_url?.message || 'Enter the full URL you want to shorten'}
                    placeholder="https://example.com/very/long/url"
                    autoFocus
                  />
                )}
              />

              <Controller
                name="namespace"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Namespace"
                    fullWidth
                    margin="normal"
                    error={!!errors.namespace}
                    helperText={errors.namespace?.message || 'Select the namespace for this short URL'}
                    disabled={!namespaces || namespaces.length === 0}
                  >
                    {namespaces?.map((namespace) => (
                      <MenuItem key={namespace.id} value={namespace.id}>
                        {namespace.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="short_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Custom Short Code (Optional)"
                    fullWidth
                    margin="normal"
                    error={!!errors.short_code}
                    helperText={
                      errors.short_code?.message ||
                      'Leave empty to auto-generate. Only letters, numbers, hyphens, and underscores allowed.'
                    }
                    placeholder="my-custom-code"
                  />
                )}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !namespaces || namespaces.length === 0}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                {isSubmitting ? <CircularProgress size={20} /> : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};

export default OrganizationDetail;

