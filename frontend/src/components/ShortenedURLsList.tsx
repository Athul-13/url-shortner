import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useURLs, useDeleteShortURL } from '../hooks/queries/urls';
import type { Namespace } from '../api/services/namespaces';

interface ShortenedURLsListProps {
  organizationId: number;
  namespaces: Namespace[];
  userRole: string;
}

const ShortenedURLsList = ({ organizationId, namespaces, userRole }: ShortenedURLsListProps) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { data: urls, isLoading } = useURLs();
  const deleteURL = useDeleteShortURL();

  const canDelete = userRole === 'ADMIN' || userRole === 'EDITOR';

  // Filter URLs for namespaces in this organization
  const namespaceIds = namespaces.map((ns) => ns.id);
  const organizationURLs = urls?.filter((url) => namespaceIds.includes(url.namespace)) || [];

  const handleCopy = async (shortCode: string, id: number) => {
    const shortURL = `${window.location.origin}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(shortURL);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this shortened URL?')) {
      try {
        await deleteURL.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete URL:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Paper elevation={8} sx={{ p: 3, borderRadius: 2, background: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={8} sx={{ p: 3, borderRadius: 2, background: 'white' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <LinkIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Shortened URLs
        </Typography>
        <Chip
          label={organizationURLs.length}
          size="small"
          color="primary"
          sx={{ fontWeight: 600, height: 22 }}
        />
      </Box>

      {organizationURLs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LinkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            No shortened URLs yet. Create your first short URL to get started.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {organizationURLs.map((url, index) => (
            <Paper
              key={url.id}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              sx={{
                p: 2.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 2,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Short URL */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        color: 'primary.main',
                        fontFamily: 'monospace',
                      }}
                    >
                      /{url.short_code}
                    </Typography>
                    <Chip label={url.namespace_name} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    <Tooltip title={copiedId === url.id ? 'Copied!' : 'Copy short URL'}>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(url.short_code, url.id)}
                        sx={{
                          color: copiedId === url.id ? 'success.main' : 'text.secondary',
                        }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open original URL">
                      <IconButton
                        size="small"
                        component="a"
                        href={url.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'text.secondary' }}
                      >
                        <OpenIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Original URL */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    → {url.original_url}
                  </Typography>

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Created:</strong> {new Date(url.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <strong>By:</strong> {url.created_by_username}
                    </Typography>
                    <Chip
                      label={`${url.click_count} click${url.click_count !== 1 ? 's' : ''}`}
                      size="small"
                      color="info"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                {/* Delete Button */}
                {canDelete && (
                  <Tooltip title="Delete URL">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(url.id)}
                      sx={{
                        color: 'error.main',
                        ml: 1,
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'error.dark',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default ShortenedURLsList;

