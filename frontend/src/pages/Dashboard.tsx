import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Logout as LogoutIcon, Add as AddIcon, Business as BusinessIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizations } from '../hooks/queries/organizations';
import { ROUTES } from '../constants/routes';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: organizations, isLoading, error } = useOrganizations();

  // Redirect to create organization if user has no organizations
  useEffect(() => {
    if (!isLoading && organizations && organizations.length === 0) {
      navigate(ROUTES.CREATE_ORGANIZATION);
    }
  }, [organizations, isLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'ADMIN':
        return 'primary';
      case 'EDITOR':
        return 'success';
      case 'VIEWER':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 2.5,
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
              p: 2.5,
              mb: 2.5,
              borderRadius: 2,
              background: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6" component="h1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Welcome back, {user?.username || 'User'}!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                color="error"
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: 'error.main',
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </Box>

        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'white', fontWeight: 600, fontSize: '1.1rem' }}>
            Your Organizations
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: 'white' }} size={24} />
            </Box>
          ) : error ? (
            <Paper sx={{ p: 2.5, textAlign: 'center', borderRadius: 2 }}>
              <Typography color="error" variant="body2">
                Failed to load organizations. Please try again.
              </Typography>
            </Paper>
          ) : organizations && organizations.length > 0 ? (
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
              {organizations.map((org, index) => (
                <Card
                  key={org.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => navigate(ROUTES.ORGANIZATION_DETAIL(org.id))}
                  sx={{
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <BusinessIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
                          {org.name}
                        </Typography>
                        <Chip
                          label={org.user_role || 'VIEWER'}
                          color={getRoleColor(org.user_role)}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {org.members?.length || 0} member{org.members?.length !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Paper
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                background: 'white',
              }}
            >
              <BusinessIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
                No Organizations Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.75rem' }}>
                Create your first organization to start shortening URLs
              </Typography>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variant="contained"
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => navigate(ROUTES.CREATE_ORGANIZATION)}
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
                Create Organization
              </Button>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
