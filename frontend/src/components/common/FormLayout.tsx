import type { ReactNode } from 'react';
import { Container, Box, Paper, Typography, Alert } from '@mui/material';
import { motion } from 'framer-motion';

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  error?: string;
  children: ReactNode;
}

const FormLayout = ({ title, subtitle, error, children }: FormLayoutProps) => {
  return (
    <Container maxWidth="xs">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          elevation={8}
          sx={{
            p: 3,
            width: '100%',
            maxWidth: 400,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
          }}
        >
          <Typography
            component={motion.h1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              component={motion.p}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {subtitle}
            </Typography>
          )}

          {error && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              sx={{ mb: 2 }}
            >
              <Alert severity="error" sx={{ borderRadius: 1.5, py: 0.5 }}>
                {error}
              </Alert>
            </Box>
          )}

          <Box sx={{ mt: 0.5 }}>
            {children}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default FormLayout;
