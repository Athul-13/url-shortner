import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { organizationService } from '../api/services/organizations';
import { ROUTES } from '../constants/routes';

const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        // Validate the invitation token
        const validation = await organizationService.validateInvitation(token);

        if (!validation.valid) {
          setError(validation.error || 'Invalid or expired invitation');
          setLoading(false);
          return;
        }

        // If user is authenticated, accept the invitation immediately
        if (user) {
          try {
            const result = await organizationService.acceptInvitation(token);
            // Redirect to organization detail page
            navigate(ROUTES.ORGANIZATION_DETAIL(result.organization_id));
            return;
          } catch (err: any) {
            setError(err.response?.data?.invite_token?.[0] || err.response?.data?.error || 'Failed to accept invitation');
            setLoading(false);
            return;
          }
        }

        // If user is not authenticated, store token and redirect to signup/login
        localStorage.setItem('invite_token', token);
        const inviteInfo = {
          email: validation.email || '',
          organization_name: validation.organization_name || '',
          role: validation.role || 'VIEWER',
        };
        localStorage.setItem('invite_info', JSON.stringify(inviteInfo));

        // Redirect to signup with token in query
        navigate(`${ROUTES.SIGNUP}?invite_token=${token}`);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to validate invitation');
        setLoading(false);
      }
    };

    handleInvitation();
  }, [token, user, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography>Validating invitation...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
        p={3}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return null;
};

export default InviteAccept;

