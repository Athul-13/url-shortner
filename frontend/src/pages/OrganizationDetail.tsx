import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useOrganization } from '../hooks/queries/organizations';
import { useNamespaces } from '../hooks/queries/namespaces';
import { useCreateShortURL } from '../hooks/queries/urls';
import type { ShortURLFormData } from '../lib/validations';
import { ROUTES } from '../constants/routes';
import ShortenedURLsList from '../components/ShortenedURLsList';
import { organizationService } from '../api/services/organizations';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationHeader } from '../components/organizations/OrganizationHeader';
import { OrganizationNamespaces } from '../components/organizations/OrganizationNamespaces';
import { OrganizationMembers } from '../components/organizations/OrganizationMembers';
import { InviteMemberForm } from '../components/organizations/InviteMemberForm';
import { CreateShortURLModal } from '../components/organizations/CreateShortURLModal';

const OrganizationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const organizationId = id ? parseInt(id, 10) : 0;
  const { user } = useAuth();

  const { data: organization, isLoading: orgLoading, error: orgError, refetch: refetchOrg } = useOrganization(organizationId);
  const { data: namespaces, isLoading: namespacesLoading } = useNamespaces(organizationId);
  const createShortURL = useCreateShortURL();

  const [openModal, setOpenModal] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const isAdmin = organization?.user_role === 'ADMIN';
  const isEditor = organization?.user_role === 'EDITOR';
  const canCreateURL = isAdmin || isEditor;

  const handleInviteUser = async (data: { email: string; role: 'ADMIN' | 'EDITOR' | 'VIEWER' }) => {
    if (!organization) return;
    try {
      await organizationService.inviteUser(organization.id, data);
      setOpenInviteModal(false);
      refetchOrg();
    } catch (error) {
      console.error('Failed to invite user:', error);
      throw error;
    }
  };

  const handleUpdateMemberRole = async (memberId: number, newRole: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    if (!organization) return;
    try {
      await organizationService.updateMemberRole(organization.id, memberId, { role: newRole });
      refetchOrg();
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleCreateURL = async (data: ShortURLFormData) => {
    const submitData = {
      original_url: data.original_url,
      namespace: data.namespace,
      ...(data.short_code && data.short_code.trim() !== '' ? { short_code: data.short_code } : {}),
    };
    await createShortURL.mutateAsync(submitData);
    setOpenModal(false);
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
        {/* Header Section */}
        <Paper
          elevation={8}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            background: 'white',
          }}
        >
          <OrganizationHeader
            organization={organization}
            canCreateURL={canCreateURL}
            onBack={() => navigate(ROUTES.DASHBOARD)}
            onCreateURL={() => setOpenModal(true)}
          />
        </Paper>

        {/* Tabs for better organization */}
        <Paper
          elevation={8}
          sx={{
            borderRadius: 2,
            background: 'white',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
            }}
          >
            <Tab label="URLs" />
            {isAdmin && <Tab label="Members" />}
            {isAdmin && <Tab label="Namespaces" />}
          </Tabs>

          {/* Tab Panels */}
          <Box sx={{ p: 3 }}>
            {/* URLs Tab */}
            {activeTab === 0 && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ShortenedURLsList
                  organizationId={organizationId}
                  namespaces={namespaces || []}
                  userRole={organization.user_role || 'VIEWER'}
                />
              </Box>
            )}

            {/* Members Tab */}
            {activeTab === 1 && isAdmin && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <OrganizationMembers
                  members={organization.members}
                  currentUserId={user?.id}
                  isAdmin={isAdmin}
                  onInvite={() => setOpenInviteModal(true)}
                  onUpdateRole={handleUpdateMemberRole}
                />
              </Box>
            )}

            {/* Namespaces Tab */}
            {activeTab === 2 && isAdmin && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <OrganizationNamespaces
                  namespaces={namespaces}
                  isLoading={namespacesLoading}
                  isAdmin={isAdmin}
                  onManageNamespaces={() => navigate(ROUTES.NAMESPACES, { state: { organizationId: organization.id } })}
                />
              </Box>
            )}
          </Box>
        </Paper>

        {/* Modals */}
        <CreateShortURLModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSubmit={handleCreateURL}
          namespaces={namespaces}
          isSubmitting={createShortURL.isPending}
        />

        <InviteMemberForm
          open={openInviteModal}
          onSubmit={handleInviteUser}
          onClose={() => setOpenInviteModal(false)}
        />
      </Container>
    </Box>
  );
};

export default OrganizationDetail;
