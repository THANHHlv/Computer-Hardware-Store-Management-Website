import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  FilterListOff as FilterOffIcon,
  EditNote as EditNoteIcon,
  CancelOutlined as CancelIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { orderService } from '../../../services/order.service';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useDebounce } from '../../../hooks/useDebounce';
import { MotionPage } from '../../../components/common/MotionPage';
import { DataTable, type Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';
import { ORDER_STATUSES } from '../../../types/order.types';
import { isCancelableStatus } from '../../../utils/orderStatus';

const PAGE_SIZE = 10;

export const OrdersList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');
  const parsedUserId = userIdParam ? Number(userIdParam) : NaN;
  const hasUserScope = Number.isFinite(parsedUserId);
  const userIdFilter = hasUserScope ? parsedUserId : undefined;

  const { showError, showSuccess } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dialogs
  const [statusDialogOrder, setStatusDialogOrder] = useState<any | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [cancelOrderTarget, setCancelOrderTarget] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const debouncedSearch = useDebounce(searchKeyword, 400);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let response: any;
      const opts: any = { page, size: rowsPerPage, sort: 'createdAt,desc' };
      if (statusFilter) opts.status = statusFilter;
      if (debouncedSearch.trim()) opts.search = debouncedSearch.trim();

      if (userIdFilter !== undefined) {
        response = await orderService.getUserOrders(userIdFilter, opts);
      } else if (statusFilter) {
        try {
          response = await orderService.getOrdersByStatus(statusFilter, opts);
        } catch {
          response = await orderService.getOrders(opts);
        }
      } else {
        response = await orderService.getOrders(opts);
      }

      const rawItems = response?.content || [];
      let items = statusFilter
        ? rawItems.filter((o: any) => String(o?.status || '').toUpperCase() === statusFilter)
        : rawItems;

      // Filter by date range if specified on client side
      if (startDate) {
        const fromTime = new Date(startDate).getTime();
        items = items.filter((o: any) => new Date(o.created_at || o.createdAt).getTime() >= fromTime);
      }
      if (endDate) {
        const toTime = new Date(`${endDate}T23:59:59`).getTime();
        items = items.filter((o: any) => new Date(o.created_at || o.createdAt).getTime() <= toTime);
      }

      setOrders(items);
      const serverTotal = response?.totalElements || response?.total_elements;
      setTotal(typeof serverTotal === 'number' && !Number.isNaN(serverTotal) ? serverTotal : items.length);
    } catch (err: any) {
      showError('Không tải được danh sách đơn hàng: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter, debouncedSearch, startDate, endDate, userIdFilter]);

  const clearFilters = () => {
    setStatusFilter('');
    setSearchKeyword('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleOpenStatusDialog = (order: any) => {
    setStatusDialogOrder(order);
    setNextStatus(String(order.status || 'PENDING').toUpperCase());
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusDialogOrder?.id) return;
    setUpdatingStatus(true);
    try {
      await orderService.updateOrderStatus(statusDialogOrder.id, nextStatus);
      showSuccess(`Đã cập nhật trạng thái đơn #${statusDialogOrder.order_code || statusDialogOrder.id} sang ${nextStatus}`);
      setStatusDialogOrder(null);
      fetchOrders();
    } catch (err: any) {
      showError('Cập nhật trạng thái thất bại: ' + (err.message || err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancelOrderTarget?.id) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(cancelOrderTarget.id);
      showSuccess(`Đã hủy đơn hàng #${cancelOrderTarget.order_code || cancelOrderTarget.id}`);
      setCancelOrderTarget(null);
      fetchOrders();
    } catch (err: any) {
      showError('Hủy đơn hàng thất bại: ' + (err.message || err));
    } finally {
      setCancelling(false);
    }
  };

  const currency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const columns: Column<any>[] = [
    {
      key: 'order_code',
      label: 'MÃ ĐƠN HÀNG',
      render: (o) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: theme.palette.primary.main }}>
            #{o.order_code || o.orderCode || o.id}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(o.created_at || o.createdAt)}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'customer',
      label: 'KHÁCH HÀNG',
      render: (o) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {o.customer_name || o.customerName || 'Khách vãng lai'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {o.shipping_phone || o.customer_email || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'amount',
      label: 'TỔNG TIỀN',
      align: 'right',
      render: (o) => (
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>
          {currency(Number(o.final_amount ?? o.finalAmount ?? o.total_amount ?? o.total ?? 0))}
        </Typography>
      ),
    },
    {
      key: 'payment',
      label: 'THANH TOÁN',
      align: 'center',
      render: (o) => {
        const method = o.payment_method || o.paymentMethod || 'COD';
        const pStatus = o.payment_status || o.paymentStatus || 'UNPAID';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              {method}
            </Typography>
            <StatusBadge status={pStatus} category="payment" size="small" />
          </Box>
        );
      },
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI ĐƠN',
      align: 'center',
      render: (o) => <StatusBadge status={o.status || 'PENDING'} category="order" size="small" />,
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      align: 'right',
      render: (o) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Xem chi tiết đơn hàng">
            <IconButton size="small" color="primary" onClick={() => navigate(`/admin/orders/${o.id}`)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cập nhật trạng thái">
            <IconButton size="small" color="info" onClick={() => handleOpenStatusDialog(o)}>
              <EditNoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {isCancelableStatus(o.status) && (
            <Tooltip title="Hủy đơn hàng">
              <IconButton size="small" color="error" onClick={() => setCancelOrderTarget(o)}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <MotionPage>
      <Box sx={{ pb: 4 }}>
        <DataTable
          title={userIdFilter !== undefined ? `Đơn hàng của người dùng #${userIdFilter}` : 'Quản lý đơn hàng'}
          subtitle={`Tổng số ${total} đơn hàng`}
          columns={columns}
          data={orders}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={total}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          searchValue={searchKeyword}
          onSearchChange={setSearchKeyword}
          searchPlaceholder="Tìm theo mã đơn, tên người nhận, SĐT..."
          onRowClick={(item) => navigate(`/admin/orders/${item.id}`)}
          filters={
            <>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Trạng thái đơn</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  label="Trạng thái đơn"
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  {ORDER_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === 'PENDING'
                        ? 'Chờ xử lý'
                        : status === 'CONFIRMED'
                        ? 'Đã xác nhận'
                        : status === 'PROCESSING'
                        ? 'Đang chuẩn bị'
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

              <TextField
                size="small"
                type="date"
                label="Từ ngày"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 145 }}
              />

              <TextField
                size="small"
                type="date"
                label="Đến ngày"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 145 }}
              />

              {(statusFilter || searchKeyword || startDate || endDate) && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterOffIcon />}
                  onClick={clearFilters}
                  sx={{ borderRadius: 2 }}
                >
                  Xóa lọc
                </Button>
              )}
            </>
          }
          emptyMessage="Chưa có đơn hàng nào"
          emptyDescription="Không tìm thấy đơn hàng nào phù hợp với bộ lọc tìm kiếm hiện tại."
        />

        {/* Update Status Dialog */}
        <Dialog
          open={Boolean(statusDialogOrder)}
          onClose={() => setStatusDialogOrder(null)}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 2.5 } } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Cập nhật trạng thái đơn hàng
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Đơn hàng: <strong>#{statusDialogOrder?.order_code || statusDialogOrder?.id}</strong> —{' '}
              {statusDialogOrder?.customer_name || 'Khách hàng'}
            </Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái mới</InputLabel>
              <Select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
                label="Trạng thái mới"
              >
                {ORDER_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === 'PENDING'
                      ? 'Chờ xử lý'
                      : status === 'CONFIRMED'
                      ? 'Đã xác nhận'
                      : status === 'PROCESSING'
                      ? 'Đang chuẩn bị'
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
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setStatusDialogOrder(null)} color="inherit">
              Đóng
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmStatusUpdate}
              disabled={updatingStatus}
              sx={{ fontWeight: 700 }}
            >
              {updatingStatus ? 'Đang cập nhật...' : 'Lưu trạng thái'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Order Confirm Dialog */}
        <ConfirmDialog
          open={Boolean(cancelOrderTarget)}
          title="Hủy đơn hàng"
          message="Bạn có chắc chắn muốn hủy đơn hàng này không? Số lượng sản phẩm sẽ được tự động hoàn lại vào kho."
          itemName={`Đơn #${cancelOrderTarget?.order_code || cancelOrderTarget?.id} (${cancelOrderTarget?.customer_name || 'Khách hàng'})`}
          confirmText="Hủy đơn hàng này"
          severity="warning"
          loading={cancelling}
          onConfirm={handleConfirmCancelOrder}
          onCancel={() => setCancelOrderTarget(null)}
        />
      </Box>
    </MotionPage>
  );
};

export default OrdersList;
