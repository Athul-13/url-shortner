import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import { ROUTES } from '../../constants/routes';

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Route guard for public pages (Login, Signup)
 * - Redirects authenticated users to dashboard
 * - Allows unauthenticated users to access the page
 */
const PublicRoute = ({ children, redirectTo }: PublicRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to={redirectTo || ROUTES.DASHBOARD} replace />;
  }

  // User is not authenticated - allow access to public page
  return <>{children}</>;
};

export default PublicRoute;
