import React from 'react';
import { Chip, type ChipProps, Box } from '@mui/material';

export type StatusCategory = 'order' | 'product' | 'promotion' | 'user' | 'payment' | 'inventory';

interface StatusConfig {
  label: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';
  bg?: string;
  textColor?: string;
  borderColor?: string;
  dotColor?: string;
}

const ORDER_STATUS_MAP: Record<string, StatusConfig> = {
  PENDING: { label: 'Chờ xử lý', color: 'warning', dotColor: '#F59E0B' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'info', dotColor: '#0284C7' },
  PROCESSING: { label: 'Đang xử lý', color: 'info', dotColor: '#38BDF8' },
  SHIPPING: { label: 'Đang giao hàng', color: 'primary', dotColor: '#00F0FF' },
  DELIVERED: { label: 'Đã giao hàng', color: 'success', dotColor: '#10B981' },
  COMPLETED: { label: 'Hoàn tất', color: 'success', dotColor: '#10B981' },
  CANCELLED: { label: 'Đã hủy', color: 'error', dotColor: '#EF4444' },
  CANCELED: { label: 'Đã hủy', color: 'error', dotColor: '#EF4444' },
  RETURNED: { label: 'Đã trả hàng', color: 'default', dotColor: '#94A3B8' },
};

const PRODUCT_STATUS_MAP: Record<string, StatusConfig> = {
  IN_STOCK: { label: 'Còn hàng', color: 'success', dotColor: '#10B981' },
  LOW_STOCK: { label: 'Sắp hết hàng', color: 'warning', dotColor: '#F59E0B' },
  OUT_OF_STOCK: { label: 'Hết hàng', color: 'error', dotColor: '#EF4444' },
  ACTIVE: { label: 'Đang bán', color: 'success', dotColor: '#10B981' },
  INACTIVE: { label: 'Ngừng bán', color: 'default', dotColor: '#94A3B8' },
};

const PROMOTION_STATUS_MAP: Record<string, StatusConfig> = {
  ACTIVE: { label: 'Đang chạy', color: 'success', dotColor: '#10B981' },
  UPCOMING: { label: 'Sắp diễn ra', color: 'info', dotColor: '#00F0FF' },
  EXPIRED: { label: 'Đã hết hạn', color: 'default', dotColor: '#94A3B8' },
  INACTIVE: { label: 'Tạm ngưng', color: 'warning', dotColor: '#F59E0B' },
};

const USER_STATUS_MAP: Record<string, StatusConfig> = {
  ACTIVE: { label: 'Hoạt động', color: 'success', dotColor: '#10B981' },
  LOCKED: { label: 'Đã khóa', color: 'error', dotColor: '#EF4444' },
  INACTIVE: { label: 'Chưa kích hoạt', color: 'default', dotColor: '#94A3B8' },
};

const PAYMENT_STATUS_MAP: Record<string, StatusConfig> = {
  PAID: { label: 'Đã thanh toán', color: 'success', dotColor: '#10B981' },
  PENDING: { label: 'Chờ thanh toán', color: 'warning', dotColor: '#F59E0B' },
  UNPAID: { label: 'Chưa thanh toán', color: 'warning', dotColor: '#F59E0B' },
  FAILED: { label: 'Thanh toán lỗi', color: 'error', dotColor: '#EF4444' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'info', dotColor: '#0284C7' },
};

export interface StatusBadgeProps {
  status: string | boolean;
  category?: StatusCategory;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  showDot?: boolean;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  category = 'order',
  size = 'small',
  variant = 'filled',
  showDot = true,
  customLabel,
}) => {
  const normalizedKey = typeof status === 'boolean'
    ? (status ? 'ACTIVE' : 'INACTIVE')
    : String(status || '').trim().toUpperCase();

  let config: StatusConfig = {
    label: customLabel || String(status || '—'),
    color: 'default',
    dotColor: '#94A3B8',
  };

  switch (category) {
    case 'order':
      config = ORDER_STATUS_MAP[normalizedKey] || config;
      break;
    case 'product':
      config = PRODUCT_STATUS_MAP[normalizedKey] || config;
      break;
    case 'promotion':
      config = PROMOTION_STATUS_MAP[normalizedKey] || config;
      break;
    case 'user':
      config = USER_STATUS_MAP[normalizedKey] || config;
      break;
    case 'payment':
      config = PAYMENT_STATUS_MAP[normalizedKey] || config;
      break;
    default:
      break;
  }

  const labelText = customLabel || config.label;

  return (
    <Chip
      size={size}
      variant={variant}
      color={config.color as ChipProps['color']}
      label={
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          {showDot && config.dotColor && (
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: config.dotColor,
                display: 'inline-block',
                boxShadow: `0 0 6px ${config.dotColor}`,
              }}
            />
          )}
          <span>{labelText}</span>
        </Box>
      }
      sx={{
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        borderRadius: '9999px',
        letterSpacing: '0.02em',
        transition: 'all 200ms ease',
        '&:hover': {
          filter: 'brightness(1.08)',
        },
      }}
    />
  );
};

export default StatusBadge;
