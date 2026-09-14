import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Container,
  TextField,
  MenuItem,
  ListItemAvatar,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  alpha,
  useTheme,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';

import { ORDER_STATUSES } from '../../types/order.types';
import { isCancelableStatus } from '../../utils/orderStatus';
import { api } from '../../services/api';
import { orderService } from '../../services/order.service';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

type OrderItem = {
  id: number;
  product_id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  thumbnail?: string | null;
  image_url?: string | null;
};

type NormalizedOrder = {
  id: number;
  order_code?: string;
  customer_name?: string;
  customer_email?: string;
  shipping_address?: string;
  shipping_phone?: string;
  notes?: string;
  status?: string;
  payment_method?: string;
  payment_status?: string;
  subtotal?: number;
  total_amount?: number;
  discount_amount?: number;
  final_amount?: number;
  tax_amount?: number;
  shipping_cost?: number;
  created_at?: string;
  promotion_code?: string | null;
  promotion_name?: string | null;
  promotion_id?: number | null;
  order_items: OrderItem[];
};

const normalizeOrder = (payload: any): NormalizedOrder => ({
  id: payload.id,
  order_code: payload.order_code ?? payload.orderCode,
  customer_name: payload.customer_name ?? payload.customerName,
  customer_email: payload.customer_email ?? payload.customerEmail,
  shipping_address: payload.shipping_address ?? payload.shippingAddress,
  shipping_phone: payload.shipping_phone ?? payload.shippingPhone,
  notes: payload.notes ?? undefined,
  status: payload.status ?? undefined,
  payment_method: payload.payment_method ?? payload.paymentMethod,
  payment_status: payload.payment_status ?? payload.paymentStatus,
  subtotal: payload.subtotal ?? payload.total_amount ?? payload.totalAmount ?? 0,
  total_amount: payload.total_amount ?? payload.totalAmount ?? payload.total ?? 0,
  discount_amount: payload.discount_amount ?? payload.discountAmount ?? 0,
  final_amount:
    payload.final_amount ?? payload.finalAmount ?? payload.total_amount ?? payload.totalAmount ?? payload.total ?? 0,
  tax_amount: payload.tax_amount ?? payload.taxAmount ?? 0,
  shipping_cost: payload.shipping_cost ?? payload.shippingCost ?? 0,
  created_at: payload.created_at ?? payload.createdAt ?? undefined,
  promotion_code: payload.promotion?.code ?? payload.promotion_code ?? null,
  promotion_name: payload.promotion?.name ?? payload.promotion_name ?? null,
  promotion_id: payload.promotion?.id ?? payload.promotion_id ?? null,
  order_items: (payload.order_items ?? payload.orderItems ?? payload.items ?? []).map((it: any) => {
    const productData = it.product ?? it.productDto ?? {};
    const resolvedThumbnail =
      productData.thumbnail
      ?? productData.image_url
      ?? productData.imageUrl
      ?? it.product_thumbnail
      ?? it.productThumbnail
      ?? it.product_image_url
      ?? it.productImageUrl
      ?? it.thumbnail
      ?? it.image_url
      ?? it.imageUrl
      ?? null;
    const resolvedImageUrl =
      productData.image_url
      ?? productData.imageUrl
      ?? productData.thumbnail
      ?? it.product_image_url
      ?? it.productImageUrl
      ?? it.product_thumbnail
      ?? it.productThumbnail
      ?? it.image_url
      ?? it.imageUrl
      ?? it.thumbnail
      ?? null;
    return {
      id: it.id,
      product_id: it.product_id ?? it.productId,
      product_name: it.product_name ?? it.productName ?? it.name ?? 'Sản phẩm',
      quantity: it.quantity ?? it.qty ?? 0,
      unit_price: it.unit_price ?? it.unitPrice ?? it.price ?? 0,
      total_price: it.total_price ?? it.totalPrice ?? (Number(it.quantity ?? 0) * Number(it.unit_price ?? it.price ?? 0)),
      thumbnail: resolvedThumbnail,
      image_url: resolvedImageUrl,
    };
  }) as OrderItem[],
});

type SummaryRowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, highlight = false }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography color="text.secondary" variant="body2">{label}</Typography>
    <Typography
      fontWeight={highlight ? 800 : 600}
      color={highlight ? '#10B981' : 'text.primary'}
      sx={{ fontFamily: highlight ? 'JetBrains Mono, monospace' : 'inherit', fontSize: highlight ? '1.1rem' : '0.875rem' }}
    >
      {value}
    </Typography>
  </Stack>
);

// Custom Stepper Connector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #00F0FF 0%, #10B981 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #00F0FF 0%, #10B981 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderRadius: 1,
  },
}));

export const OrderDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const { canManageOrders } = useAuth();

  const [order, setOrder] = useState<NormalizedOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [payingVnPay, setPayingVnPay] = useState<boolean>(false);

  // Status update state & confirm dialog
  const [updating, setUpdating] = useState<boolean>(false);
  const [nextStatus, setNextStatus] = useState<string>(ORDER_STATUSES[0]);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);

  // Cancel order confirm dialog
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const currency = useMemo(() => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }), []);
  const fmt = (n?: number) => currency.format(Number(n ?? 0));

  const fetchOrder = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get<any>(`/orders/${id}`, { signal });
      let payload: any = null;
      const anyResp: any = resp;
      if (anyResp?.data && typeof anyResp.data === 'object' && !Array.isArray(anyResp.data)) {
        payload = anyResp.data;
      } else {
        payload = anyResp;
      }

      if (!payload || typeof payload !== 'object') {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
      }

      const normalized = normalizeOrder(payload);
      setOrder(normalized);
      setNextStatus(normalized.status || ORDER_STATUSES[0]);
    } catch (e: any) {
      if (e?.name !== 'CanceledError' && e?.message !== 'canceled') {
        console.error('OrderDetail Fetch error:', e);
        setError(e?.message || 'Không thể tải chi tiết đơn hàng');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrder(controller.signal);
    return () => controller.abort();
  }, [fetchOrder]);

  const handlePayVnPay = async () => {
    if (!order?.id) return;
    setPayingVnPay(true);
    try {
      const resp: any = await api.post(`/payments/vnpay/create/${order.id}`);
      const body = resp?.data || resp;
      const paymentUrl = body?.paymentUrl || body?.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        showError('Không thể tạo link thanh toán VNPay.');
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || err?.message || 'Không thể kết nối cổng VNPay');
    } finally {
      setPayingVnPay(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(Number(id));
      showSuccess('Đơn hàng đã được hủy thành công!');
      setConfirmCancelOpen(false);
      await fetchOrder();
    } catch (err: any) {
      showError(err?.message || 'Hủy đơn hàng thất bại');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmStatus = async () => {
    if (!id) return;
    const statusToSend = (nextStatus || ORDER_STATUSES[0]).toUpperCase();
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(Number(id), statusToSend);
      showSuccess(`Cập nhật trạng thái đơn hàng sang ${statusToSend} thành công!`);
      setConfirmUpdateOpen(false);
      await fetchOrder();
    } catch (err: any) {
      showError(err?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!order) return <Typography sx={{ m: 3 }}>Không tìm thấy đơn hàng</Typography>;

  const createdAtDisplay = order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : 'Chưa cập nhật';
  const subtotalDisplay = fmt(order.subtotal ?? order.total_amount);
  const discountDisplay = order.discount_amount ? `- ${fmt(order.discount_amount)}` : fmt(0);
  const finalDisplay = fmt(order.final_amount ?? order.total_amount);
  const taxDisplay = fmt(order.tax_amount);
  const shippingDisplay = order.shipping_cost && order.shipping_cost > 0 ? fmt(order.shipping_cost) : 'Miễn phí';
  const canCancelOrder = isCancelableStatus(order.status);

  // Determine timeline active step
  const normalizedStatus = String(order.status || 'PENDING').toUpperCase();
  const isCancelled = normalizedStatus === 'CANCELLED' || normalizedStatus === 'CANCELED';

  const steps = [
    { label: 'Đã đặt hàng', icon: <ShoppingBagRoundedIcon fontSize="small" /> },
    { label: 'Đã xác nhận', icon: <AssignmentTurnedInRoundedIcon fontSize="small" /> },
    { label: 'Đang giao hàng', icon: <LocalShippingRoundedIcon fontSize="small" /> },
    { label: 'Hoàn tất', icon: <CheckCircleRoundedIcon fontSize="small" /> },
  ];

  let activeStep = 0;
  if (['CONFIRMED', 'PROCESSING'].includes(normalizedStatus)) activeStep = 1;
  else if (['SHIPPING', 'SHIPPED'].includes(normalizedStatus)) activeStep = 2;
  else if (['DELIVERED', 'COMPLETED'].includes(normalizedStatus)) activeStep = 3;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top action bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2 }}
          >
            Quay lại
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Đơn hàng #{order.order_code || order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ngày đặt: {createdAtDisplay}
            </Typography>
          </Box>
        </Box>

        <StatusBadge status={order.status || 'PENDING'} category="order" size="medium" />
      </Box>

      {/* 1. Timeline Stepper */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
          Tiến trình xử lý đơn hàng
        </Typography>

        {isCancelled ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CancelRoundedIcon color="error" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>
                Đơn hàng đã bị hủy
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đơn hàng này không tiếp tục luồng xử lý giao nhận. Sản phẩm đã được hoàn trả tồn kho.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
            {steps.map((step, index) => {
              const isStepCompleted = activeStep >= index;
              return (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isStepCompleted ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5),
                          color: isStepCompleted ? '#0A0E17' : 'text.disabled',
                          boxShadow: isStepCompleted ? `0 0 12px ${alpha(theme.palette.primary.main, 0.5)}` : 'none',
                          transition: 'all 300ms ease',
                        }}
                      >
                        {step.icon}
                      </Box>
                    )}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: activeStep === index ? 800 : isStepCompleted ? 600 : 400,
                        color: activeStep === index ? theme.palette.primary.main : 'text.primary',
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        )}
      </Paper>

      {/* 2. Main content 2-column layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' },
          gap: 3,
          alignItems: 'flex-start',
        }}
      >
        {/* Left Column: Customer info & Items list */}
        <Stack spacing={3}>
          {/* Customer & Shipping info */}
          <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin người nhận hàng
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>Người nhận:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.customer_name || '—'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>Số điện thoại:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.shipping_phone || '—'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>Email liên hệ:</Typography>
                <Typography variant="body2">{order.customer_email || '—'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>Địa chỉ giao hàng:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.shipping_address || '—'}</Typography>
              </Box>
              {order.notes && (
                <Box sx={{ display: 'flex', gap: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>Ghi chú đơn:</Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{order.notes}</Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Product Items List */}
          <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Danh sách sản phẩm ({order.order_items.length})
            </Typography>

            <List disablePadding>
              {order.order_items.map((it, idx) => (
                <React.Fragment key={it.id || idx}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar sx={{ minWidth: 64 }}>
                      <Avatar
                        variant="rounded"
                        src={(it.thumbnail ?? it.image_url) ?? undefined}
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {it.product_name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {it.product_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Số lượng: <strong>{it.quantity}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          · Đơn giá: <strong>{fmt(it.unit_price)}</strong>
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right', ml: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 800, color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {fmt(it.total_price)}
                      </Typography>
                      {it.product_id && (
                        <Button
                          component={RouterLink}
                          to={`/product/${it.product_id}`}
                          size="small"
                          sx={{ fontSize: '0.75rem', mt: 0.5 }}
                        >
                          Xem sản phẩm
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                  {idx < order.order_items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Stack>

        {/* Right Column: Payment info, Price Summary & Actions */}
        <Stack spacing={3}>
          {/* Payment Method & Status Card */}
          <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Thông tin thanh toán
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}>
                  {order.payment_method === 'VNPAY' ? (
                    <CreditCardRoundedIcon />
                  ) : order.payment_method === 'BANKING' ? (
                    <AccountBalanceWalletRoundedIcon />
                  ) : (
                    <LocalAtmRoundedIcon />
                  )}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {order.payment_method === 'VNPAY'
                      ? 'Cổng VNPay (QR / Thẻ)'
                      : order.payment_method === 'BANKING'
                      ? 'Chuyển khoản ngân hàng'
                      : 'Thanh toán khi nhận hàng (COD)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Phương thức thanh toán
                  </Typography>
                </Box>
              </Box>

              <StatusBadge status={order.payment_status || 'UNPAID'} category="payment" size="small" />
            </Box>

            {order.payment_method === 'VNPAY' && order.payment_status !== 'PAID' && order.status === 'PENDING' && (
              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={payingVnPay}
                onClick={handlePayVnPay}
                sx={{
                  fontWeight: 700,
                  bgcolor: '#00F0FF',
                  color: '#0A0E17',
                  '&:hover': { bgcolor: '#00d5e2' },
                }}
              >
                {payingVnPay ? 'Đang kết nối cổng VNPay...' : 'Thanh toán trực tiếp qua VNPay'}
              </Button>
            )}
          </Paper>

          {/* Price Summary */}
          <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Chi phí đơn hàng
            </Typography>

            <Stack spacing={1.5}>
              <SummaryRow label="Tổng tiền hàng (Tạm tính)" value={subtotalDisplay} />
              <SummaryRow label="Thuế VAT (10%)" value={taxDisplay} />
              <SummaryRow label="Phí vận chuyển" value={shippingDisplay} />
              {order.discount_amount && order.discount_amount > 0 ? (
                <SummaryRow label="Mã khuyến mãi áp dụng" value={discountDisplay} />
              ) : null}
              <Divider sx={{ my: 1 }} />
              <SummaryRow label="Tổng thanh toán cuối" value={finalDisplay} highlight />
            </Stack>
          </Paper>

          {/* Admin / Staff Management Actions */}
          {canManageOrders && (
            <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Thao tác quản lý đơn hàng
              </Typography>

              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái đơn hàng</InputLabel>
                  <Select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    label="Trạng thái đơn hàng"
                    disabled={updating || isCancelled}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status === 'PENDING'
                          ? 'Chờ xử lý'
                          : status === 'CONFIRMED'
                          ? 'Đã xác nhận'
                          : status === 'PROCESSING'
                          ? 'Đang chuẩn bị hàng'
                          : status === 'SHIPPING'
                          ? 'Đang giao hàng'
                          : status === 'DELIVERED'
                          ? 'Đã giao hàng'
                          : status === 'COMPLETED'
                          ? 'Hoàn tất'
                          : status === 'CANCELLED'
                          ? 'Đã hủy'
                          : status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={updating || isCancelled || nextStatus === order.status}
                  onClick={() => setConfirmUpdateOpen(true)}
                  sx={{ fontWeight: 700 }}
                >
                  Cập nhật trạng thái
                </Button>

                {canCancelOrder && (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    disabled={updating}
                    onClick={() => setConfirmCancelOpen(true)}
                    sx={{ fontWeight: 600 }}
                  >
                    Hủy đơn hàng này
                  </Button>
                )}
              </Stack>
            </Paper>
          )}
        </Stack>
      </Box>

      {/* Confirm Status Update Modal */}
      <ConfirmDialog
        open={confirmUpdateOpen}
        title="Cập nhật trạng thái đơn hàng"
        message={`Bạn có chắc chắn muốn chuyển đơn hàng #${order.order_code || order.id} sang trạng thái "${nextStatus}" không?`}
        itemName={`Đơn hàng #${order.order_code || order.id}`}
        confirmText="Lưu trạng thái"
        severity="info"
        loading={updating}
        onConfirm={handleConfirmStatus}
        onCancel={() => setConfirmUpdateOpen(false)}
      />

      {/* Confirm Cancel Order Modal */}
      <ConfirmDialog
        open={confirmCancelOpen}
        title="Hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không? Số lượng sản phẩm sẽ được tự động hoàn lại vào kho."
        itemName={`Đơn hàng #${order.order_code || order.id}`}
        confirmText="Xác nhận hủy đơn"
        severity="warning"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmCancelOpen(false)}
      />
    </Box>
  );
};

export default OrderDetailPage;
