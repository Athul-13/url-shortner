import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Namespace } from '../../api/services/namespaces';

interface NamespaceTableProps {
  namespaces: Namespace[];
  isAdmin: boolean;
  onEdit: (namespace: Namespace) => void;
  onDelete: (namespace: Namespace) => void;
}

export const NamespaceTable = ({ namespaces, isAdmin, onEdit, onDelete }: NamespaceTableProps) => {
  return (
    <TableContainer component={Paper} elevation={8} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Organization</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created</TableCell>
            {isAdmin && <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {namespaces.map((namespace) => (
            <TableRow
              key={namespace.id}
              component={motion.tr}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <TableCell>
                <strong>{namespace.name}</strong>
              </TableCell>
              <TableCell>{namespace.organization_name}</TableCell>
              <TableCell>
                {new Date(namespace.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </TableCell>
              {isAdmin && (
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(namespace)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(namespace)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

