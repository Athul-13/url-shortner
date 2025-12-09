import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, FormControl, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { People as PeopleIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import type { OrganizationMember } from '../../api/services/organizations';

interface OrganizationMembersProps {
  members: OrganizationMember[] | undefined;
  currentUserId: number | undefined;
  isAdmin: boolean;
  onInvite: () => void;
  onUpdateRole: (memberId: number, newRole: 'ADMIN' | 'EDITOR' | 'VIEWER') => void;
}

export const OrganizationMembers = ({
  members,
  currentUserId,
  isAdmin,
  onInvite,
  onUpdateRole,
}: OrganizationMembersProps) => {
  if (!isAdmin) {
    return null;
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
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
            <PeopleIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Members & Invitations
            </Typography>
          </Box>
          <Button
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={onInvite}
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
            Invite Member
          </Button>
        </Box>

        {members && members.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.username}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={member.role}
                        size="small"
                        color={
                          member.role === 'ADMIN'
                            ? 'primary'
                            : member.role === 'EDITOR'
                            ? 'success'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      {member.user !== currentUserId && (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={member.role}
                            onChange={(e) =>
                              onUpdateRole(member.id, e.target.value as 'ADMIN' | 'EDITOR' | 'VIEWER')
                            }
                          >
                            <MenuItem value="VIEWER">Viewer</MenuItem>
                            <MenuItem value="EDITOR">Editor</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                      {member.user === currentUserId && (
                        <Typography variant="body2" color="text.secondary">
                          You
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No members yet. Invite your first member to get started.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

