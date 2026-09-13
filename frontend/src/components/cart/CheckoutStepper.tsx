import React from 'react';
import { Box, Stack, Typography, useTheme, useMediaQuery, alpha } from '@mui/material';
import { ShoppingBag, Truck, CreditCard, CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export interface CheckoutStepperProps {
  activeStep: number; // 0: Cart, 1: Shipping info, 2: Payment, 3: Completed
}

const STEPS = [
  { label: 'Giỏ hàng', icon: ShoppingBag },
  { label: 'Thông tin giao hàng', icon: Truck },
  { label: 'Thanh toán', icon: CreditCard },
  { label: 'Hoàn tất đơn hàng', icon: CheckCircle2 },
];

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ activeStep }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldReduceMotion = useReducedMotion();

  return (
    <Box
      sx={{
        width: '100%',
        py: { xs: 2.5, md: 3 },
        px: { xs: 2, md: 4 },
        mb: { xs: 4, md: 5 },
        bgcolor: theme.palette.background.paper,
        borderRadius: 3.5,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isLight
          ? '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -2px rgba(15, 23, 42, 0.06)'
          : '0 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ position: 'relative' }}
      >
        {STEPS.map((step, idx) => {
          const IconComp = step.icon as any;
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <React.Fragment key={`step-${idx}`}>
              {/* Step Item */}
              <Stack
                alignItems="center"
                spacing={1}
                sx={{
                  zIndex: 2,
                  position: 'relative',
                  flex: isMobile ? 1 : 'none',
                }}
              >
                <Box
                  component={shouldReduceMotion ? 'div' : motion.div}
                  animate={isCurrent && !shouldReduceMotion ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  sx={{
                    width: { xs: 36, md: 44 },
                    height: { xs: 36, md: 44 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isDone
                      ? theme.palette.secondary.main
                      : isCurrent
                      ? theme.palette.primary.main
                      : isLight ? 'rgba(15, 23, 42, 0.06)' : '#1E293B',
                    color: isDone || isCurrent ? '#FFFFFF' : 'text.secondary',
                    border: isCurrent
                      ? `2px solid ${theme.palette.primary.main}`
                      : isDone
                      ? `2px solid ${theme.palette.secondary.main}`
                      : `2px solid ${theme.palette.divider}`,
                    boxShadow: isCurrent
                      ? `0 0 16px ${alpha(theme.palette.primary.main, 0.4)}`
                      : isDone
                      ? `0 0 12px ${alpha(theme.palette.secondary.main, 0.35)}`
                      : 'none',
                    transition: 'all 250ms ease',
                  }}
                >
                  <IconComp size={isMobile ? 18 : 22} />
                </Box>

                {!isMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                      color: isCurrent
                        ? theme.palette.primary.main
                        : isDone
                        ? 'text.primary'
                        : 'text.secondary',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.label}
                  </Typography>
                )}
              </Stack>

              {/* Connecting Line between steps */}
              {idx < STEPS.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 3,
                    mx: { xs: 0.5, md: 2 },
                    bgcolor: isDone
                      ? theme.palette.secondary.main
                      : isLight ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    zIndex: 1,
                    transition: 'background-color 300ms ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Stack>
    </Box>
  );
};
