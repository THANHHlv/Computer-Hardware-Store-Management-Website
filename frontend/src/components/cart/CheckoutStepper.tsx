import React from 'react';
import { Box, Stack, Typography, useTheme, useMediaQuery } from '@mui/material';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldReduceMotion = useReducedMotion();

  return (
    <Box
      sx={{
        width: '100%',
        py: { xs: 2.5, md: 3 },
        px: { xs: 2, md: 4 },
        mb: { xs: 4, md: 5 },
        bgcolor: '#131B2E',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
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
                      ? '#10B981'
                      : isCurrent
                      ? '#00F0FF'
                      : '#1E293B',
                    color: isDone || isCurrent ? '#0A0E17' : '#64748B',
                    border: isCurrent
                      ? '2px solid #00F0FF'
                      : isDone
                      ? '2px solid #10B981'
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isCurrent
                      ? '0 0 16px rgba(0, 240, 255, 0.45)'
                      : isDone
                      ? '0 0 12px rgba(16, 185, 129, 0.35)'
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
                        ? '#00F0FF'
                        : isDone
                        ? '#F8FAFC'
                        : '#64748B',
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
                    height: 2,
                    mx: { xs: 1, md: 2 },
                    bgcolor: idx < activeStep ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: idx < activeStep ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none',
                    transition: 'background-color 300ms ease',
                    position: 'relative',
                    top: isMobile ? 0 : -10,
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

export default CheckoutStepper;
