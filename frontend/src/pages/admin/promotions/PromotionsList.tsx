import React, { useEffect, useMemo, useState } from 'react';
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
  Switch,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  FilterListOff as FilterOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { promotionService } from '../../../services/promotion.service';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useDebounce } from '../../../hooks/useDebounce';
import { MotionPage } from '../../../components/common/MotionPage';
import { DataTable, type Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';

const PAGE_SIZE = 10;

const parseDate = (value?: string | Date | null) => {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const evaluateTemporalStatus = (promo: any, now = Date.now()) => {
  const startDate = parseDate(promo.start_date ?? promo.startDate);
  const endDate = parseDate(promo.end_date ?? promo.endDate);
  const backendActive = Boolean(promo.is_active ?? promo.isActive ?? true);

  const hasStarted = !startDate || startDate.getTime() <= now;
  const isExpired = endDate ? endDate.getTime() < now : false;

  let statusKey: 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE' = 'ACTIVE';

  if (!backendActive) {
    statusKey = 'INACTIVE';
  } else if (isExpired) {
    statusKey = 'EXPIRED';
  } else if (!hasStarted) {
    statusKey = 'UPCOMING';
  } else {
    statusKey = 'ACTIVE';
  }

  return { startDate, endDate, isExpired, hasStarted, statusKey };
};

export const PromotionsList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showError, showSuccess } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState('');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearch = useDebounce(searchKeyword, 400);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const opts: any = { page, size: rowsPerPage };
      if (debouncedSearch.trim()) opts.search = debouncedSearch.trim();
      if (discountTypeFilter) opts.discountType = discountTypeFilter;

      if (statusFilter === 'active') {
        opts.isActive = true;
      } else if (statusFilter === 'inactive') {
        opts.isActive = false;
      }

      const resp = await promotionService.getPromotions(opts);
      const raw = resp.content || [];
      setPromotions(raw);
      setTotal(resp.totalElements || raw.length);
    } catch (err: any) {
      showError('Không tải được danh sách khuyến mãi: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter, discountTypeFilter, debouncedSearch]);

  const handleToggleStatus = async (promoId: number, activate: boolean) => {
    try {
      await promotionService.togglePromotionStatus(promoId, activate);
      showSuccess(`Đã ${activate ? 'kích hoạt' : 'tạm dừng'} khuyến mãi thành công`);
      fetchPromotions();
    } catch (e: any) {
      showError('Cập nhật trạng thái thất bại: ' + (e.message || e));
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDiscountTypeFilter('');
    setSearchKeyword('');
    setPage(0);
  };

  const formatDate = (d?: Date) => {
    if (!d) return '—';
    return d.toLocaleDateString('vi-VN');
  };

  const currency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

  const enrichedData = useMemo(() => {
    const now = Date.now();
    return promotions.map((p) => {
      const temporal = evaluateTemporalStatus(p, now);
      return {
        ...p,
        _temporal: temporal,
      };
    });
  }, [promotions]);

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'TÊN KHUYẾN MÃI',
      render: (p) => (
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {p.name}
          </Typography>
          {p.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {p.description}
            </Typography>
          )}
          {p.code && (
            <Chip
              label={`Mã: ${p.code}`}
              size="small"
              variant="outlined"
              sx={{ mt: 0.5, height: 20, fontSize: '0.7rem', fontWeight: 700 }}
            />
          )}
        </Box>
      ),
    },
    {
      key: 'discount',
      label: 'MỨC GIẢM GIÁ',
      align: 'center',
      render: (p) => {
        const type = p.discount_type || p.discountType || 'PERCENTAGE';
        const val = Number(p.discount_value ?? p.discountValue ?? 0);
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {type === 'PERCENTAGE' ? `GIẢM ${val}%` : `GIẢM ${currency(val)}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {type === 'PERCENTAGE' ? 'Phần trăm giá trị' : 'Số tiền cố định'}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: 'dates',
      label: 'THỜI GIAN ÁP DỤNG',
      align: 'center',
      render: (p) => (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
            {formatDate(p._temporal.startDate)} → {formatDate(p._temporal.endDate)}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI HIỆU LỰC',
      align: 'center',
      render: (p) => (
        <StatusBadge status={p._temporal.statusKey} category="promotion" size="small" />
      ),
    },
    {
      key: 'toggle',
      label: 'BẬT / TẮT',
      align: 'center',
      render: (p) => {
        const isExp = p._temporal.isExpired;
        const isActive = Boolean(p.is_active ?? p.isActive ?? true);
        return (
          <Tooltip title={isExp ? 'Khuyến mãi đã hết hạn' : isActive ? 'Tạm ngưng' : 'Kích hoạt ngay'}>
            <span>
              <Switch
                size="small"
                color="success"
                checked={isActive}
                disabled={isExp}
                onChange={(_e, checked) => handleToggleStatus(p.id, checked)}
              />
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      align: 'right',
      render: (p) => (
        <Tooltip title="Chỉnh sửa khuyến mãi">
          <IconButton size="small" color="primary" onClick={() => navigate(`/admin/promotions/${p.id}/edit`)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <MotionPage>
      <Box sx={{ pb: 4 }}>
        <DataTable
          title="Quản lý khuyến mãi & Voucher"
          subtitle={`Tổng số ${total} chương trình khuyến mãi`}
          columns={columns}
          data={enrichedData}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={total}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          searchValue={searchKeyword}
          onSearchChange={setSearchKeyword}
          searchPlaceholder="Tìm theo tên khuyến mãi, mô tả..."
          actions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/promotions/create')}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Tạo khuyến mãi
            </Button>
          }
          filters={
            <>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Loại giảm giá</InputLabel>
                <Select
                  value={discountTypeFilter}
                  onChange={(e) => {
                    setDiscountTypeFilter(e.target.value);
                    setPage(0);
                  }}
                  label="Loại giảm giá"
                >
                  <MenuItem value="">Tất cả loại</MenuItem>
                  <MenuItem value="PERCENTAGE">Giảm theo %</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Giảm số tiền cố định</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="active">Đang bật</MenuItem>
                  <MenuItem value="inactive">Đang tắt</MenuItem>
                </Select>
              </FormControl>

              {(searchKeyword || statusFilter || discountTypeFilter) && (
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
          emptyMessage="Chưa có chương trình khuyến mãi nào"
          emptyDescription="Không tìm thấy khuyến mãi nào phù hợp với bộ lọc tìm kiếm."
        />
      </Box>
    </MotionPage>
  );
};

export default PromotionsList;
