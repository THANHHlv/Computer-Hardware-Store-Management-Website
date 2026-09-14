import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Tabs,
  Tab,
  Typography,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  Avatar,
  alpha,
  useTheme,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Inventory2Outlined as InventoryAdjustIcon,
  Warehouse as WarehouseIcon,
  History as HistoryIcon,
  WarningAmberRounded as WarningIcon,
  FilterListOff as FilterOffIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { inventoryService, type InventoryLog, type StockAdjustmentRequest } from '../../../services/inventory.service';
import { productService } from '../../../services/product.service';
import type { Product } from '../../../types/product.types';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useAuth } from '../../../hooks/useAuth';
import { useDebounce } from '../../../hooks/useDebounce';
import { MotionPage } from '../../../components/common/MotionPage';
import { DataTable, type Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';

const PAGE_SIZE = 10;

type InventoryLogChangeType = 'IN' | 'OUT';

interface InventoryLogRow {
  id: number;
  productId: number | null;
  productName: string | null;
  changeType: InventoryLogChangeType;
  quantityChange: number;
  reason: string;
  performedById: number | null;
  performedByUsername: string | null;
  createdAt: string | null;
}

interface ProductOption {
  id: number;
  name: string;
  quantity: number;
  low_stock_threshold?: number | null;
}

const CHANGE_OPTIONS: Array<{ value: StockAdjustmentRequest['change_type']; label: string; direction: InventoryLogChangeType }> = [
  { value: 'IN', label: 'Nhập kho thêm (+ IN)', direction: 'IN' },
  { value: 'OUT', label: 'Xuất kho / Giảm (- OUT)', direction: 'OUT' },
];

export const InventoryList: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const [activeTab, setActiveTab] = useState<number>(0);

  // --- TAB 1: Tồn kho sản phẩm (Product Stock) ---
  const [stockLoading, setStockLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockPage, setStockPage] = useState(0);
  const [stockRowsPerPage, setStockRowsPerPage] = useState(PAGE_SIZE);
  const [stockTotal, setStockTotal] = useState(0);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 400);

  // --- TAB 2: Nhật ký kho (Inventory Logs) ---
  const [logsLoading, setLogsLoading] = useState(false);
  const [logs, setLogs] = useState<InventoryLogRow[]>([]);
  const [logsPage, setLogsPage] = useState(0);
  const [logsRowsPerPage, setLogsRowsPerPage] = useState(PAGE_SIZE);
  const [logsTotal, setLogsTotal] = useState(0);
  const [changeTypeFilter, setChangeTypeFilter] = useState<InventoryLogChangeType | ''>('');
  const [logSearch, setLogSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debouncedLogSearch = useDebounce(logSearch, 400);

  // --- ADJUST DIALOG ---
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [changeType, setChangeType] = useState<StockAdjustmentRequest['change_type']>('IN');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [dialogSearch, setDialogSearch] = useState<string>('');
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loadingProductOptions, setLoadingProductOptions] = useState(false);
  const [submittingAdjust, setSubmittingAdjust] = useState(false);
  const debouncedDialogSearch = useDebounce(dialogSearch.trim(), 400);

  // 1. Fetch products for Tab 1
  const fetchProducts = useCallback(async () => {
    setStockLoading(true);
    try {
      const resp = await productService.getManagementProducts({
        page: stockPage,
        size: stockRowsPerPage,
        sort: 'quantity,asc',
        stockStatus: stockFilter !== 'all' ? stockFilter : undefined,
        search: debouncedProductSearch.trim() || undefined,
      });
      setProducts(resp.content || []);
      setStockTotal(resp.totalElements || 0);
    } catch (err: any) {
      showError('Không tải được danh sách tồn kho: ' + (err.message || err));
    } finally {
      setStockLoading(false);
    }
  }, [stockPage, stockRowsPerPage, stockFilter, debouncedProductSearch, showError]);

  // 2. Fetch inventory logs for Tab 2
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const response = await inventoryService.getInventoryLogs({
        page: logsPage,
        size: logsRowsPerPage,
        changeType: changeTypeFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: debouncedLogSearch.trim() || undefined,
      });
      const rawLogs = (response?.content ?? []) as InventoryLog[];
      const mapped: InventoryLogRow[] = rawLogs.map((log) => {
        const change = (log.change_type ?? log.changeType ?? '').toString().toUpperCase();
        return {
          id: log.id,
          productId: typeof log.product_id === 'number' ? log.product_id : log.productId ?? null,
          productName: log.product_name ?? log.productName ?? null,
          changeType: change === 'OUT' ? 'OUT' : 'IN',
          quantityChange: log.quantity_change ?? log.quantityChange ?? 0,
          reason: log.reason ?? '',
          performedById: typeof log.performed_by === 'number' ? log.performed_by : log.performed_by_id ?? null,
          performedByUsername: log.performed_by_username ?? log.performedByUsername ?? null,
          createdAt: log.created_at ?? log.createdAt ?? null,
        };
      });

      setLogs(mapped);
      setLogsTotal(response?.totalElements || mapped.length);
    } catch (err: any) {
      showError('Không tải được lịch sử kho: ' + (err.message || err));
    } finally {
      setLogsLoading(false);
    }
  }, [logsPage, logsRowsPerPage, changeTypeFilter, dateFrom, dateTo, debouncedLogSearch, showError]);

  useEffect(() => {
    if (activeTab === 0) fetchProducts();
    else fetchLogs();
  }, [activeTab, fetchProducts, fetchLogs]);

  // Dialog product options loader
  useEffect(() => {
    if (!adjustDialogOpen) return;
    let cancel = false;
    (async () => {
      setLoadingProductOptions(true);
      try {
        const res = debouncedDialogSearch.length >= 2
          ? await productService.searchProducts(debouncedDialogSearch, { page: 0, size: 20 })
          : await productService.getAllProducts({ page: 0, size: 20 });
        if (!cancel) {
          const opts = (res.content ?? []).map((p: Product) => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            low_stock_threshold: p.low_stock_threshold,
          }));
          setProductOptions(opts);
        }
      } catch {
        // Non-fatal
      } finally {
        if (!cancel) setLoadingProductOptions(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [adjustDialogOpen, debouncedDialogSearch]);

  const handleOpenAdjust = (prod?: Product) => {
    if (prod) {
      setSelectedProduct({
        id: prod.id,
        name: prod.name,
        quantity: prod.quantity,
        low_stock_threshold: prod.low_stock_threshold,
      });
    } else {
      setSelectedProduct(null);
    }
    setChangeType('IN');
    setAdjustQuantity(1);
    setAdjustReason('');
    setAdjustDialogOpen(true);
  };

  const handleAdjustSubmit = async () => {
    if (!selectedProduct?.id) {
      showError('Vui lòng chọn sản phẩm cần điều chỉnh');
      return;
    }
    if (adjustQuantity <= 0) {
      showError('Số lượng điều chỉnh phải lớn hơn 0');
      return;
    }
    if (!adjustReason.trim()) {
      showError('Vui lòng nhập lý do điều chỉnh kho');
      return;
    }

    setSubmittingAdjust(true);
    try {
      await inventoryService.adjustInventory(selectedProduct.id, {
        quantity: adjustQuantity,
        change_type: changeType,
        reason: adjustReason.trim(),
        performed_by_id: user?.id ? Number(user.id) : 1,
      });
      showSuccess(`Đã ${changeType === 'IN' ? 'nhập thêm' : 'xuất'} ${adjustQuantity} sản phẩm thành công!`);
      setAdjustDialogOpen(false);
      fetchProducts();
      if (activeTab === 1) fetchLogs();
    } catch (err: any) {
      showError('Điều chỉnh tồn kho thất bại: ' + (err.message || err));
    } finally {
      setSubmittingAdjust(false);
    }
  };

  const currency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN');
  };

  // Columns for Tab 1: Product Stock
  const stockColumns: Column<Product>[] = [
    {
      key: 'name',
      label: 'SẢN PHẨM',
      render: (p) => {
        const isOut = (p.quantity ?? 0) <= 0;
        const isLow = !isOut && p.quantity <= (p.low_stock_threshold || 10);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 220 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 44,
                height: 44,
                bgcolor: isOut ? alpha(theme.palette.error.main, 0.12) : isLow ? alpha(theme.palette.warning.main, 0.12) : alpha(theme.palette.primary.main, 0.08),
                color: isOut ? 'error.main' : isLow ? 'warning.main' : 'primary.main',
                fontWeight: 700,
              }}
            >
              {isOut || isLow ? <WarningIcon fontSize="small" /> : p.name.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {p.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: #{p.id} · Danh mục: {p.category?.name || '—'}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      key: 'price',
      label: 'ĐƠN GIÁ',
      align: 'right',
      render: (p) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>
          {currency(p.price)}
        </Typography>
      ),
    },
    {
      key: 'quantity',
      label: 'TỒN KHO THỰC TẾ',
      align: 'center',
      render: (p) => {
        const isOut = (p.quantity ?? 0) <= 0;
        const isLow = !isOut && p.quantity <= (p.low_stock_threshold || 10);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: isOut ? 'error.main' : isLow ? 'warning.main' : 'text.primary',
              }}
            >
              {p.quantity}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (ngưỡng: {p.low_stock_threshold || 10})
            </Typography>
          </Box>
        );
      },
    },
    {
      key: 'status',
      label: 'CẢNH BÁO TỒN KHO',
      align: 'center',
      render: (p) => {
        const isOut = (p.quantity ?? 0) <= 0;
        const isLow = !isOut && p.quantity <= (p.low_stock_threshold || 10);
        const statusKey = isOut ? 'OUT_OF_STOCK' : isLow ? 'LOW_STOCK' : 'IN_STOCK';
        return <StatusBadge status={statusKey} category="product" size="small" />;
      },
    },
    {
      key: 'action',
      label: 'THAO TÁC',
      align: 'right',
      render: (p) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<InventoryAdjustIcon fontSize="small" />}
          onClick={() => handleOpenAdjust(p)}
          sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.75rem' }}
        >
          Điều chỉnh
        </Button>
      ),
    },
  ];

  // Columns for Tab 2: Inventory Logs
  const logColumns: Column<InventoryLogRow>[] = [
    {
      key: 'createdAt',
      label: 'THỜI GIAN',
      render: (l) => (
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
          {formatDate(l.createdAt)}
        </Typography>
      ),
    },
    {
      key: 'productName',
      label: 'SẢN PHẨM',
      render: (l) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {l.productName || `Sản phẩm #${l.productId}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: #{l.productId}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'changeType',
      label: 'LOẠI THAY ĐỔI',
      align: 'center',
      render: (l) => (
        <Chip
          size="small"
          label={l.changeType === 'IN' ? 'Nhập kho (IN)' : 'Xuất kho (OUT)'}
          color={l.changeType === 'IN' ? 'success' : 'error'}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
      ),
    },
    {
      key: 'quantityChange',
      label: 'SỐ LƯỢNG',
      align: 'center',
      render: (l) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: l.changeType === 'IN' ? '#10B981' : '#EF4444',
          }}
        >
          {l.changeType === 'IN' ? `+${l.quantityChange}` : `-${l.quantityChange}`}
        </Typography>
      ),
    },
    {
      key: 'reason',
      label: 'LÝ DO / GHI CHÚ',
      render: (l) => (
        <Typography variant="body2" color="text.secondary">
          {l.reason || '—'}
        </Typography>
      ),
    },
    {
      key: 'performedBy',
      label: 'NGƯỜI THỰC HIỆN',
      align: 'center',
      render: (l) => (
        <Chip
          size="small"
          label={l.performedByUsername || (l.performedById ? `User #${l.performedById}` : 'Hệ thống')}
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      ),
    },
  ];

  return (
    <MotionPage>
      <Box sx={{ pb: 4 }}>
        {/* Header with quick stats & adjust button */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Quản lý kho & Tồn kho
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Theo dõi tồn kho thực tế, cảnh báo sắp hết hàng và nhật ký nhập xuất
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenAdjust()}
            sx={{ fontWeight: 700, borderRadius: 2, px: 2.5 }}
          >
            + Điều chỉnh tồn kho
          </Button>
        </Box>

        {/* Tab navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_e, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.925rem',
                textTransform: 'none',
                minHeight: 48,
              },
            }}
          >
            <Tab
              icon={<WarehouseIcon fontSize="small" />}
              iconPosition="start"
              label="Tồn kho sản phẩm"
            />
            <Tab
              icon={<HistoryIcon fontSize="small" />}
              iconPosition="start"
              label="Lịch sử biến động kho"
            />
          </Tabs>
        </Box>

        {/* TAB 1: Product Stock */}
        {activeTab === 0 && (
          <DataTable
            title="Danh sách tồn kho sản phẩm"
            subtitle={`Tổng số ${stockTotal} sản phẩm`}
            columns={stockColumns}
            data={products}
            loading={stockLoading}
            page={stockPage}
            rowsPerPage={stockRowsPerPage}
            totalRows={stockTotal}
            onPageChange={setStockPage}
            onRowsPerPageChange={setStockRowsPerPage}
            searchValue={productSearch}
            onSearchChange={setProductSearch}
            searchPlaceholder="Tìm kiếm theo tên sản phẩm..."
            filters={
              <>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Mức độ tồn</InputLabel>
                  <Select
                    value={stockFilter}
                    onChange={(e) => {
                      setStockFilter(e.target.value as any);
                      setStockPage(0);
                    }}
                    label="Mức độ tồn"
                  >
                    <MenuItem value="all">Tất cả sản phẩm</MenuItem>
                    <MenuItem value="low_stock">⚠️ Sắp hết hàng</MenuItem>
                    <MenuItem value="out_of_stock">❌ Đã hết hàng</MenuItem>
                    <MenuItem value="in_stock">✅ Còn hàng</MenuItem>
                  </Select>
                </FormControl>

                {(productSearch || stockFilter !== 'all') && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FilterOffIcon />}
                    onClick={() => {
                      setProductSearch('');
                      setStockFilter('all');
                      setStockPage(0);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Xóa lọc
                  </Button>
                )}
              </>
            }
            emptyMessage="Không có sản phẩm nào"
            emptyDescription="Không tìm thấy sản phẩm nào trong kho khớp với điều kiện lọc."
          />
        )}

        {/* TAB 2: Inventory Logs */}
        {activeTab === 1 && (
          <DataTable
            title="Nhật ký biến động kho"
            subtitle={`Tổng số ${logsTotal} bản ghi lịch sử`}
            columns={logColumns}
            data={logs}
            loading={logsLoading}
            page={logsPage}
            rowsPerPage={logsRowsPerPage}
            totalRows={logsTotal}
            onPageChange={setLogsPage}
            onRowsPerPageChange={setLogsRowsPerPage}
            searchValue={logSearch}
            onSearchChange={setLogSearch}
            searchPlaceholder="Tìm theo sản phẩm, lý do..."
            filters={
              <>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Loại thay đổi</InputLabel>
                  <Select
                    value={changeTypeFilter}
                    onChange={(e) => {
                      setChangeTypeFilter(e.target.value as any);
                      setLogsPage(0);
                    }}
                    label="Loại thay đổi"
                  >
                    <MenuItem value="">Tất cả loại</MenuItem>
                    <MenuItem value="IN">Nhập kho (IN)</MenuItem>
                    <MenuItem value="OUT">Xuất kho (OUT)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  type="date"
                  label="Từ ngày"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setLogsPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 145 }}
                />

                <TextField
                  size="small"
                  type="date"
                  label="Đến ngày"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setLogsPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 145 }}
                />

                {(changeTypeFilter || logSearch || dateFrom || dateTo) && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FilterOffIcon />}
                    onClick={() => {
                      setChangeTypeFilter('');
                      setLogSearch('');
                      setDateFrom('');
                      setDateTo('');
                      setLogsPage(0);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Xóa lọc
                  </Button>
                )}
              </>
            }
            emptyMessage="Chưa có nhật ký kho"
            emptyDescription="Chưa có bản ghi nhập xuất nào phù hợp với bộ lọc."
          />
        )}

        {/* Adjust Stock Dialog */}
        <Dialog
          open={adjustDialogOpen}
          onClose={() => setAdjustDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 2.5 } } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Điều chỉnh tồn kho sản phẩm
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2.5}>
              <Autocomplete
                value={selectedProduct}
                onChange={(_e, val) => setSelectedProduct(val)}
                options={productOptions}
                getOptionLabel={(opt) => `${opt.name} (Tồn hiện tại: ${opt.quantity})`}
                loading={loadingProductOptions}
                onInputChange={(_e, val) => setDialogSearch(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn sản phẩm"
                    placeholder="Nhập tên sản phẩm để tìm kiếm..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingProductOptions ? <CircularProgress size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Loại thao tác</InputLabel>
                <Select
                  value={changeType}
                  onChange={(e) => setChangeType(e.target.value as any)}
                  label="Loại thao tác"
                >
                  {CHANGE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                type="number"
                label="Số lượng điều chỉnh"
                fullWidth
                size="small"
                inputProps={{ min: 1 }}
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(Math.max(1, Number(e.target.value)))}
              />

              <TextField
                label="Lý do điều chỉnh"
                fullWidth
                multiline
                rows={3}
                placeholder="Ví dụ: Nhập hàng đợt mới từ nhà phân phối, Xuất trả bảo hành..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />

              {user && (
                <Typography variant="caption" color="text.secondary">
                  Thực hiện bởi: <strong>{user.full_name || user.username}</strong> ({user.role})
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setAdjustDialogOpen(false)} color="inherit">
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleAdjustSubmit}
              disabled={submittingAdjust}
              sx={{ fontWeight: 700 }}
            >
              {submittingAdjust ? 'Đang thực hiện...' : 'Xác nhận điều chỉnh'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MotionPage>
  );
};

export default InventoryList;
