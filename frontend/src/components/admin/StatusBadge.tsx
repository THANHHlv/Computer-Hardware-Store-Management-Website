import React from 'react';
import { Box, Typography } from '@mui/material';

export type StatusCategory = 'order' | 'product' | 'promotion' | 'user' | 'payment' | 'inventory';

interface StatusTheme {
  label: string;
  bg: string;
  color: string;
  borderColor: string;
  dotColor: string;
}

const ORDER_STATUS_MAP: Record<string, StatusTheme> = {
  PENDING: { label: 'Chờ xử lý', bg: '#FFFBEB', color: '#92400E', borderColor: '#FDE68A', dotColor: '#F59E0B' },
  CONFIRMED: { label: 'Đã xác nhận', bg: '#EFF6FF', color: '#1E40AF', borderColor: '#BFDBFE', dotColor: '#3B82F6' },
  PROCESSING: { label: 'Đang chuẩn bị hàng', bg: '#EFF6FF', color: '#1E40AF', borderColor: '#BFDBFE', dotColor: '#3B82F6' },
  SHIPPING: { label: 'Đang giao hàng', bg: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0', dotColor: '#22C55E' },
  SHIPPED: { label: 'Đang giao hàng', bg: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0', dotColor: '#22C55E' },
  DELIVERED: { label: 'Đã giao thành công', bg: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', dotColor: '#10B981' },
  COMPLETED: { label: 'Hoàn tất', bg: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', dotColor: '#10B981' },
  CANCELLED: { label: 'Đã hủy', bg: '#FEF2F2', color: '#991B1B', borderColor: '#FECACA', dotColor: '#EF4444' },
  CANCELED: { label: 'Đã hủy', bg: '#FEF2F2', color: '#991B1B', borderColor: '#FECACA', dotColor: '#EF4444' },
  RETURNED: { label: 'Đã trả hàng', bg: '#F3F4F6', color: '#374151', borderColor: '#E5E7EB', dotColor: '#9CA3AF' },
};

const PRODUCT_STATUS_MAP: Record<string, StatusTheme> = {
  IN_STOCK: { label: 'Còn hàng', bg: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', dotColor: '#10B981' },
  LOW_STOCK: { label: 'Sắp hết hàng', bg: '#FFFBEB', color: '#92400E', borderColor: '#FDE68A', dotColor: '#F59E0B' },
  OUT_OF_STOCK: { label: 'Hết hàng', bg: '#FEF2F2', color: '#991B1B', borderColor: '#FECACA', dotColor: '#EF4444' },
  ACTIVE: { label: 'Đang mở bán', bg: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', dotColor: '#10B981' },
  INACTIVE: { label: 'Ngừng kinh doanh', bg: '#F3F4F6', color: '#374151', borderColor: '#E5E7EB', dotColor: '#9CA3AF' },
};

const PROMOTION_STATUS_MAP: Record<string, StatusTheme> = {
  ACTIVE: { label: 'Đang chạy', bg: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', dotColor: '#10B981' },
  UPCOMING: { label: 'Sắp diễn ra', bg: '#EFF6FF', color: '#1E40AF', borderColor: '#BFDBFE', dotColor: '#3B82F6' },
  EXPIRED: { label: 'Đã hết hạn', bg: '#F3F4F6', color: '#4B5563', borderColor: '#E5E7EB', dotColor: '#9CA3AF' },
  INACTIVE: { label: 'Tạm ngưng', bg: '#FFFBEB', color: '#92400E', borderColor: '#FDE68A', dotColor: '#F59E0B' },
};

const USER_STATUS_MAP: Record<string, StatusTheme> = {
  ACTIVE: { label: 'Đang hoạt động', bg: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', dotColor: '#10B981' },
  LOCKED: { label: 'Đã khóa', bg: '#FEF2F2', color: '#991B1B', borderColor: '#FECACA', dotColor: '#EF4444' },
  INACTIVE: { label: 'Chưa kích hoạt', bg: '#F3F4F6', color: '#4B5563', borderColor: '#E5E7EB', dotColor: '#9CA3AF' },
  CUSTOMER: { label: 'Khách hàng', bg: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0', dotColor: '#22C55E' },
  STAFF: { label: 'Nhân viên', bg: '#EFF6FF', color: '#1E40AF', borderColor: '#BFDBFE', dotColor: '#3B82F6' },
  ADMIN: { label: 'Quản trị viên', bg: '#FFF7ED', color: '#C2410C', borderColor: '#FFEDD5', dotColor: '#EA580C' },
};

const PAYMENT_STATUS_MAP: Record<string, StatusTheme> = {
  PAID: { label: 'Đã thanh toán', bg: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', dotColor: '#10B981' },
  PENDING: { label: 'Chờ thanh toán', bg: '#FFFBEB', color: '#92400E', borderColor: '#FDE68A', dotColor: '#F59E0B' },
  UNPAID: { label: 'Chưa thanh toán', bg: '#FFFBEB', color: '#92400E', borderColor: '#FDE68A', dotColor: '#F59E0B' },
  FAILED: { label: 'Thanh toán lỗi', bg: '#FEF2F2', color: '#991B1B', borderColor: '#FECACA', dotColor: '#EF4444' },
  REFUNDED: { label: 'Đã hoàn tiền', bg: '#EFF6FF', color: '#1E40AF', borderColor: '#BFDBFE', dotColor: '#3B82F6' },
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
  showDot = true,
  customLabel,
}) => {
  const normalizedKey = typeof status === 'boolean'
    ? (status ? 'ACTIVE' : 'INACTIVE')
    : String(status || '').trim().toUpperCase();

  let themeConfig: StatusTheme = {
    label: customLabel || String(status || '—'),
    bg: '#F3F4F6',
    color: '#374151',
    borderColor: '#E5E7EB',
    dotColor: '#9CA3AF',
  };

  switch (category) {
    case 'order':
      themeConfig = ORDER_STATUS_MAP[normalizedKey] || themeConfig;
      break;
    case 'product':
      themeConfig = PRODUCT_STATUS_MAP[normalizedKey] || themeConfig;
      break;
    case 'promotion':
      themeConfig = PROMOTION_STATUS_MAP[normalizedKey] || themeConfig;
      break;
    case 'user':
      themeConfig = USER_STATUS_MAP[normalizedKey] || themeConfig;
      break;
    case 'payment':
      themeConfig = PAYMENT_STATUS_MAP[normalizedKey] || themeConfig;
      break;
    default:
      break;
  }

  const labelText = customLabel || themeConfig.label;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: size === 'small' ? 1.25 : 1.75,
        py: size === 'small' ? 0.35 : 0.6,
        borderRadius: '9999px',
        bgcolor: themeConfig.bg,
        color: themeConfig.color,
        border: `1px solid ${themeConfig.borderColor}`,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transition: 'all 150ms ease',
      }}
    >
      {showDot && (
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: themeConfig.dotColor,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      <Typography
        component="span"
        sx={{
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
          lineHeight: 'inherit',
        }}
      >
        {labelText}
      </Typography>
    </Box>
  );
};

export default StatusBadge;
