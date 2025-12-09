import { useEffect } from 'react';
import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { namespaceSchema, type NamespaceFormData } from '../../lib/validations';
import type { Organization } from '../../api/services/organizations';
import type { Namespace } from '../../api/services/namespaces';

interface NamespaceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NamespaceFormData) => Promise<void>;
  organizations: Organization[] | undefined;
  editingNamespace: Namespace | null;
  isSubmitting: boolean;
}

export const NamespaceForm = ({
  open,
  onClose,
  onSubmit,
  organizations,
  editingNamespace,
  isSubmitting,
}: NamespaceFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NamespaceFormData>({
    resolver: zodResolver(namespaceSchema),
    mode: 'onChange',
    defaultValues: {
      name: editingNamespace?.name || '',
      organization: editingNamespace?.organization || 0,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingNamespace ? 'Edit Namespace' : 'Create Namespace'}
        </DialogTitle>
        <DialogContent>
          {errors.root && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}

          <Controller
            name="organization"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Organization"
                fullWidth
                margin="normal"
                error={!!errors.organization}
                helperText={errors.organization?.message}
                disabled={!!editingNamespace}
              >
                {organizations?.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Namespace Name"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message || 'Only letters, numbers, and underscores allowed'}
                placeholder="my_namespace"
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
            disabled={isSubmitting}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={20} /> : editingNamespace ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

