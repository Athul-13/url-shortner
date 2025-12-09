import { Box, Typography, IconButton, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowBack as ArrowBackIcon, Business as BusinessIcon, Link as LinkIcon } from '@mui/icons-material';
import type { Organization } from '../../api/services/organizations';

interface OrganizationHeaderProps {
  organization: Organization;
  canCreateURL: boolean;
  onBack: () => void;
  onCreateURL: () => void;
}

export const OrganizationHeader = ({ organization, canCreateURL, onBack, onCreateURL }: OrganizationHeaderProps) => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onBack} size="small">
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
            onClick={onCreateURL}
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Created: {new Date(organization.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Typography>
    </Box>
  );
};

