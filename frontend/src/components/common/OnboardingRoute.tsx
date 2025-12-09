import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganizations } from '../../hooks/queries/organizations';
import { CircularProgress, Box } from '@mui/material';
import { ROUTES } from '../../constants/routes';

interface OnboardingRouteProps {
  children: ReactNode;
}

/**
 * Route guard for onboarding pages (like CreateOrganization)
 * - Requires authentication
 * - Only allows access if user has NO organizations (onboarding flow)
 * - Redirects to dashboard if user already has organizations
 */
const OnboardingRoute = ({ children }: OnboardingRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();

  // Show loading while checking auth
  if (authLoading || orgsLoading) {
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

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If user already has organizations, redirect to dashboard
  // (They've already completed onboarding)
  if (organizations && organizations.length > 0) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // User is authenticated and has no organizations - allow onboarding
  return <>{children}</>;
};

export default OnboardingRoute;
