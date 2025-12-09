import { Box, type BoxProps } from '@mui/material';
import { motion } from 'framer-motion';

interface AnimatedBoxProps extends BoxProps {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedBox = ({ children, delay = 0, ...props }: AnimatedBoxProps) => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </Box>
  );
};
