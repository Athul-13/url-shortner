import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Folder as FolderIcon } from '@mui/icons-material';
import type { Namespace } from '../../api/services/namespaces';

interface OrganizationNamespacesProps {
  namespaces: Namespace[] | undefined;
  isLoading: boolean;
  isAdmin: boolean;
  onManageNamespaces: () => void;
}

export const OrganizationNamespaces = ({
  namespaces,
  isLoading,
  isAdmin,
  onManageNamespaces,
}: OrganizationNamespacesProps) => {
  if (!isAdmin) {
    return null;
  }

  return (
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
            onClick={onManageNamespaces}
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

        {isLoading ? (
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
                  onClick={onManageNamespaces}
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
              onClick={onManageNamespaces}
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
  );
};

