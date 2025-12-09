import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shortURLSchema, type ShortURLFormData } from '../../lib/validations';
import type { Namespace } from '../../api/services/namespaces';

interface CreateShortURLModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ShortURLFormData) => Promise<void>;
  namespaces: Namespace[] | undefined;
  isSubmitting: boolean;
}

export const CreateShortURLModal = ({
  open,
  onClose,
  onSubmit,
  namespaces,
  isSubmitting,
}: CreateShortURLModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ShortURLFormData>({
    resolver: zodResolver(shortURLSchema),
    mode: 'onChange',
    defaultValues: {
      original_url: '',
      namespace: 0,
      short_code: '',
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        original_url: '',
        namespace: namespaces && namespaces.length > 0 ? namespaces[0].id : 0,
        short_code: '',
      });
    }
  }, [open, namespaces, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Create Short URL</DialogTitle>
        <DialogContent>
          {errors.root && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}

          {namespaces && namespaces.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No namespaces available. Please create a namespace first.
            </Alert>
          ) : null}

          <Controller
            name="original_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="URL to Shorten"
                fullWidth
                margin="normal"
                error={!!errors.original_url}
                helperText={errors.original_url?.message || 'Enter the full URL you want to shorten'}
                placeholder="https://example.com/very/long/url"
                autoFocus
              />
            )}
          />

          <Controller
            name="namespace"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Namespace"
                fullWidth
                margin="normal"
                error={!!errors.namespace}
                helperText={errors.namespace?.message || 'Select the namespace for this short URL'}
                disabled={!namespaces || namespaces.length === 0}
              >
                {namespaces?.map((namespace) => (
                  <MenuItem key={namespace.id} value={namespace.id}>
                    {namespace.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="short_code"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Custom Short Code (Optional)"
                fullWidth
                margin="normal"
                error={!!errors.short_code}
                helperText={
                  errors.short_code?.message ||
                  'Leave empty to auto-generate. Only letters, numbers, hyphens, and underscores allowed.'
                }
                placeholder="my-custom-code"
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !namespaces || namespaces.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

