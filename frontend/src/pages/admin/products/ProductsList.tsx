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
  Avatar,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterListOff as FilterOffIcon,
  Visibility as ViewIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../../../services/product.service';
import { categoryService } from '../../../services/category.service';
import type { Product, Category } from '../../../types/product.types';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useDebounce } from '../../../hooks/useDebounce';
import { MotionPage } from '../../../components/common/MotionPage';
import { DataTable, type Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';

const PAGE_SIZE = 10;

export const ProductsList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);

  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Confirm dialog state for delete
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchKeyword, 400);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = debouncedSearch.trim().toLowerCase();
      const query: {
        page: number;
        size: number;
        sort: string;
        categoryId?: number;
        stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
        search?: string;
      } = {
        page,
        size: rowsPerPage,
        sort: 'updatedAt,desc',
      };

      if (selectedCategory) {
        query.categoryId = Number(selectedCategory);
      }

      if (stockFilter !== 'all') {
        query.stockStatus = stockFilter;
      }

      if (q) {
        query.search = q;
      }

      const resp = await productService.getManagementProducts(query);
      setProducts(resp.content || []);
      setTotal(resp.totalElements || 0);
    } catch (err: any) {
      showError('Không tải được danh sách sản phẩm: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getActiveCategories();
      setCategories(cats);
    } catch {
      // Non-fatal
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync category query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catId = params.get('category') || params.get('categoryId');
    if (catId) {
      setSelectedCategory(Number(catId));
    }
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, debouncedSearch, selectedCategory, stockFilter]);

  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setStockFilter('all');
    setPage(0);
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const updatePayload = {
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock_quantity: product.quantity,
        low_stock_threshold: product.low_stock_threshold || 10,
        category_id: product.category?.id || 0,
        specifications: product.specifications || {},
        is_active: !product.is_active,
      };

      await productService.updateProduct(product.id!, updatePayload);
      showSuccess(`Sản phẩm "${product.name}" đã được ${product.is_active ? 'ẩn' : 'mở bán'}`);
      fetchProducts();
    } catch (err: any) {
      showError('Cập nhật trạng thái thất bại: ' + (err.message || err));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(deleteTarget.id);
      showSuccess(`Đã xóa sản phẩm "${deleteTarget.name}" thành công`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      showError('Xóa sản phẩm thất bại: ' + (err.message || err));
    } finally {
      setDeleting(false);
    }
  };

  const currency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN');
  };

  const columns: Column<Product>[] = [
    {
      key: 'product',
      label: 'SẢN PHẨM',
      render: (p) => {
        const primaryImg = p.images?.find((img) => img.is_primary)?.file_path || p.images?.[0]?.file_path;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 220 }}>
            <Avatar
              variant="rounded"
              src={primaryImg}
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {p.name.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {p.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                ID: #{p.id} · Danh mục: <strong>{p.category?.name || '—'}</strong>
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      key: 'price',
      label: 'GIÁ BÁN',
      align: 'right',
      render: (p) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>
          {currency(p.price)}
        </Typography>
      ),
    },
    {
      key: 'stock',
      label: 'TỒN KHO',
      align: 'center',
      render: (p) => {
        const isOut = (p.quantity ?? 0) <= 0;
        const isLow = !isOut && p.quantity <= (p.low_stock_threshold || 10);
        const statusKey = isOut ? 'OUT_OF_STOCK' : isLow ? 'LOW_STOCK' : 'IN_STOCK';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {p.quantity}
            </Typography>
            <StatusBadge status={statusKey} category="product" size="small" />
          </Box>
        );
      },
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI BÁN',
      align: 'center',
      render: (p) => (
        <StatusBadge status={Boolean(p.is_active)} category="product" size="small" />
      ),
    },
    {
      key: 'updated_at',
      label: 'CẬP NHẬT',
      align: 'center',
      render: (p) => (
        <Typography variant="caption" color="text.secondary">
          {formatDate(p.updated_at || (p as any).updatedAt)}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      align: 'right',
      render: (p) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title={p.is_active ? 'Ẩn sản phẩm' : 'Kích hoạt mở bán'}>
            <IconButton
              size="small"
              onClick={() => handleToggleStatus(p)}
              sx={{ color: p.is_active ? 'success.main' : 'text.disabled' }}
            >
              {p.is_active ? <ToggleOnIcon fontSize="medium" /> : <ToggleOffIcon fontSize="medium" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Xem trang sản phẩm">
            <IconButton size="small" onClick={() => navigate(`/product/${p.id}`)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Chỉnh sửa sản phẩm">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/admin/products/${p.id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Xóa sản phẩm">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteTarget(p)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <MotionPage>
      <Box sx={{ pb: 4 }}>
        <DataTable<Product>
          title="Quản lý sản phẩm"
          subtitle={`Tổng số ${total} sản phẩm trong hệ thống`}
          columns={columns}
          data={products}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={total}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          searchValue={searchKeyword}
          onSearchChange={setSearchKeyword}
          searchPlaceholder="Tìm theo tên sản phẩm, mã ID..."
          actions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/products/create')}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Tạo sản phẩm
            </Button>
          }
          filters={
            <>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as number | '');
                    setPage(0);
                  }}
                  label="Danh mục"
                >
                  <MenuItem value="">Tất cả danh mục</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Tồn kho</InputLabel>
                <Select
                  value={stockFilter}
                  onChange={(e) => {
                    setStockFilter(e.target.value as any);
                    setPage(0);
                  }}
                  label="Tồn kho"
                >
                  <MenuItem value="all">Tất cả tồn kho</MenuItem>
                  <MenuItem value="in_stock">Còn hàng</MenuItem>
                  <MenuItem value="low_stock">Sắp hết hàng</MenuItem>
                  <MenuItem value="out_of_stock">Hết hàng</MenuItem>
                </Select>
              </FormControl>

              {(searchKeyword || selectedCategory || stockFilter !== 'all') && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterOffIcon />}
                  onClick={clearFilters}
                  sx={{ borderRadius: 2 }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </>
          }
          emptyMessage="Chưa có sản phẩm nào"
          emptyDescription="Không tìm thấy sản phẩm nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm."
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Xóa sản phẩm"
          message="Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này khỏi hệ thống không? Dữ liệu đơn hàng trong quá khứ vẫn sẽ được lưu trữ."
          itemName={deleteTarget?.name}
          confirmText="Xóa sản phẩm"
          severity="error"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      </Box>
    </MotionPage>
  );
};

export default ProductsList;
