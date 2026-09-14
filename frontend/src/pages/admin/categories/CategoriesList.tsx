import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../../services/category.service';
import type { Category } from '../../../types/product.types';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { MotionPage } from '../../../components/common/MotionPage';
import { DataTable, type Column } from '../../../components/admin/DataTable';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';

export const CategoriesList: React.FC = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const resp = await categoryService.getCategories();
      setCategories(resp || []);
    } catch (err: any) {
      showError('Không tải được danh mục: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await categoryService.deleteCategory(deleteTarget.id);
      showSuccess(`Đã xóa danh mục "${deleteTarget.name}" thành công`);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      showError('Xóa danh mục thất bại: ' + (err.message || err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = categories.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q);
  });

  const columns: Column<Category>[] = [
    {
      key: 'id',
      label: 'ID',
      width: 80,
      render: (c) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
          #{c.id}
        </Typography>
      ),
    },
    {
      key: 'name',
      label: 'TÊN DANH MỤC',
      render: (c) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {c.name}
          </Typography>
          {c.description && (
            <Typography variant="caption" color="text.secondary">
              {c.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'slug',
      label: 'ĐƯỜNG DẪN TĨNH',
      render: (c) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
          /{c.slug}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      align: 'right',
      render: (c) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Cấu hình thuộc tính động">
            <IconButton size="small" color="info" onClick={() => navigate(`/admin/categories/${c.id}/attributes`)}>
              <TuneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa danh mục">
            <IconButton size="small" color="primary" onClick={() => navigate(`/admin/categories/${c.id}/edit`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa danh mục">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}>
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
        <DataTable<Category>
          title="Quản lý danh mục sản phẩm"
          subtitle={`Tổng số ${categories.length} danh mục`}
          columns={columns}
          data={filtered}
          loading={loading}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm theo tên danh mục, slug..."
          actions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/categories/create')}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Tạo danh mục
            </Button>
          }
          emptyMessage="Chưa có danh mục nào"
          emptyDescription="Không tìm thấy danh mục sản phẩm phù hợp."
        />

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Xóa danh mục sản phẩm"
          message="Bạn có chắc chắn muốn xóa danh mục này không? Các sản phẩm thuộc danh mục này cần được chuyển sang danh mục khác trước khi xóa."
          itemName={deleteTarget?.name}
          confirmText="Xóa danh mục"
          severity="error"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      </Box>
    </MotionPage>
  );
};

export default CategoriesList;
