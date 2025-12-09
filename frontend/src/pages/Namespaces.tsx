import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Alert,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useNamespaces, useCreateNamespace, useUpdateNamespace, useDeleteNamespace } from '../hooks/queries/namespaces';
import { useOrganizations } from '../hooks/queries/organizations';
import type { NamespaceFormData } from '../lib/validations';
import { ROUTES } from '../constants/routes';
import type { Namespace } from '../api/services/namespaces';
import { NamespaceTable } from '../components/namespaces/NamespaceTable';
import { NamespaceForm } from '../components/namespaces/NamespaceForm';

const Namespaces = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orgIdFromState = (location.state as { organizationId?: number })?.organizationId;
  const [selectedOrganization, setSelectedOrganization] = useState<number | ''>(
    orgIdFromState || ''
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNamespace, setEditingNamespace] = useState<Namespace | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Namespace | null>(null);

  const { data: organizations } = useOrganizations();
  const { data: namespaces, isLoading: namespacesLoading, error } = useNamespaces(
    selectedOrganization ? Number(selectedOrganization) : undefined
  );

  const createNamespace = useCreateNamespace();
  const updateNamespace = useUpdateNamespace();
  const deleteNamespace = useDeleteNamespace();

  const handleOpenCreate = () => {
    setEditingNamespace(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (namespace: Namespace) => {
    setEditingNamespace(namespace);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNamespace(null);
  };

  const onSubmit = async (data: NamespaceFormData) => {
    try {
      if (editingNamespace) {
        await updateNamespace.mutateAsync({
          id: editingNamespace.id,
          data: { name: data.name },
        });
      } else {
        await createNamespace.mutateAsync(data);
      }
      handleCloseDialog();
    } catch (error) {
      // Error handling is done in the form component
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteNamespace.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete namespace:', error);
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to delete namespace. Please try again.';
      alert(errorMessage);
    }
  };

  const getUserRole = (orgId: number): 'ADMIN' | 'EDITOR' | 'VIEWER' | null => {
    const org = organizations?.find((o) => o.id === orgId);
    return org?.user_role || null;
  };

  const isAdmin = selectedOrganization ? getUserRole(Number(selectedOrganization)) === 'ADMIN' : false;

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
                <IconButton
                  onClick={() => {
                    if (orgIdFromState) {
                      navigate(ROUTES.ORGANIZATION_DETAIL(orgIdFromState));
                    } else {
                      navigate(ROUTES.DASHBOARD);
                    }
                  }}
                  size="small"
                >
                  <ArrowBackIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FolderIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                    Namespaces
                  </Typography>
                </Box>
              </Box>
              {isAdmin && (
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreate}
                  disabled={!selectedOrganization}
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
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                select
                label="Select Organization"
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value as number | '')}
                fullWidth
                size="small"
                disabled={!!orgIdFromState}
                sx={{ maxWidth: 400 }}
              >
                <MenuItem value="">All Organizations</MenuItem>
                {organizations?.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name} {org.user_role && <Chip label={org.user_role} size="small" sx={{ ml: 1 }} />}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Paper>
        </Box>

        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {namespacesLoading ? (
            <Paper elevation={8} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <CircularProgress />
            </Paper>
          ) : error ? (
            <Paper elevation={8} sx={{ p: 3, borderRadius: 2 }}>
              <Alert severity="error">Failed to load namespaces. Please try again.</Alert>
            </Paper>
          ) : namespaces && namespaces.length > 0 ? (
            <NamespaceTable
              namespaces={namespaces}
              isAdmin={isAdmin}
              onEdit={handleOpenEdit}
              onDelete={setDeleteConfirm}
            />
          ) : (
            <Paper elevation={8} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                No Namespaces Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedOrganization
                  ? 'This organization has no namespaces yet.'
                  : 'Select an organization to view its namespaces.'}
              </Typography>
              {isAdmin && selectedOrganization && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreate}
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
                  Create Your First Namespace
                </Button>
              )}
            </Paper>
          )}
        </Box>

        {/* Create/Edit Dialog */}
        <NamespaceForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={onSubmit}
          organizations={organizations}
          editingNamespace={editingNamespace}
          isSubmitting={createNamespace.isPending || updateNamespace.isPending}
        />

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
            <DialogTitle>Delete Namespace</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete the namespace <strong>{deleteConfirm.name}</strong>? This action cannot
                be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                onClick={handleDelete}
                color="error"
                variant="contained"
                disabled={deleteNamespace.isPending}
              >
                {deleteNamespace.isPending ? <CircularProgress size={20} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
};

export default Namespaces;
