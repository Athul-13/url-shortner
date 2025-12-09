import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useOrganization } from '../hooks/queries/organizations';
import { useNamespaces } from '../hooks/queries/namespaces';
import { ROUTES } from '../constants/routes';

const OrganizationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const organizationId = id ? parseInt(id, 10) : 0;

  const { data: organization, isLoading: orgLoading, error: orgError } = useOrganization(organizationId);
  const { data: namespaces, isLoading: namespacesLoading } = useNamespaces(organizationId);

  const isAdmin = organization?.user_role === 'ADMIN';

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
      </Container>
    </Box>
  );
};

export default OrganizationDetail;

