import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Box, type BoxProps } from '@mui/material';

interface MotionPageProps extends BoxProps {
  children: React.ReactNode;
}

/**
 * Reusable page wrapper with smooth transition micro-interactions.
 * Automatically respects `prefers-reduced-motion` for accessibility.
 */
export const MotionPage: React.FC<MotionPageProps> = ({ children, sx, ...rest }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <Box sx={{ minHeight: '100vh', ...sx }} {...rest}>
        {children}
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
      sx={{ minHeight: '100vh', ...sx }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default MotionPage;
