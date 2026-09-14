import React, { useCallback, useEffect, useState } from 'react';
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
  Chip,
  Avatar,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockOutlined as LockIcon,
  LockOpenOutlined as UnlockIcon,
  ShoppingBagOutlined as OrdersIcon,
  FilterListOff as FilterOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../services/user.service';
import type { UserResponse } from '../../../types/auth.types';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useAuth } from '../../../hooks/useAuth';
import { useDebounce } from '../../../hooks/useDebounce';
import { MotionPage } from '../../../components/common/MotionPage';
import { DataTable, type Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';

const DEFAULT_PAGE_SIZE = 10;

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Quản trị viên', color: '#00F0FF' },
  STAFF: { label: 'Nhân viên', color: '#10B981' },
  CUSTOMER: { label: 'Khách hàng', color: '#94A3B8' },
};

export const UsersList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showError, showSuccess } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalElements, setTotalElements] = useState(0);

  const [roleFilter, setRoleFilter] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 400);

  // Confirm dialogs
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [lockTarget, setLockTarget] = useState<UserResponse | null>(null);
  const [locking, setLocking] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers({
        page,
        size: rowsPerPage,
        sort: 'createdAt,desc',
        search: debouncedSearch.trim() || undefined,
      });

      const rawItems = response?.content || [];
      const filtered = roleFilter
        ? rawItems.filter((u) => String(u.role).toUpperCase() === roleFilter)
        : rawItems;

      setUsers(filtered);
      setTotalElements(response?.totalElements || filtered.length);
    } catch (err: any) {
      showError('Không tải được danh sách người dùng: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, roleFilter, showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const clearFilters = () => {
    setRoleFilter('');
    setSearchValue('');
    setPage(0);
  };

  const isSelf = (targetUser: UserResponse) => {
    if (!currentUser) return false;
    if (currentUser.id && targetUser.id && currentUser.id === targetUser.id) return true;
    if (currentUser.username && targetUser.username && currentUser.username === targetUser.username) return true;
    return false;
  };

  const handleToggleLock = async () => {
    if (!lockTarget?.id) return;
    if (isSelf(lockTarget)) {
      showError('Bạn không thể tự khóa tài khoản của chính mình');
      return;
    }

    setLocking(true);
    const newActiveState = !lockTarget.is_active;
    try {
      await userService.updateUser(lockTarget.id, { is_active: newActiveState });
      showSuccess(`Đã ${newActiveState ? 'mở khóa' : 'khóa'} tài khoản "${lockTarget.username}" thành công`);
      setLockTarget(null);
      fetchUsers();
    } catch (err: any) {
      showError('Cập nhật trạng thái người dùng thất bại: ' + (err.message || err));
    } finally {
      setLocking(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    if (isSelf(deleteTarget)) {
      showError('Bạn không thể tự xóa tài khoản của chính mình');
      return;
    }

    setDeleting(true);
    try {
      await userService.deleteUser(deleteTarget.id);
      showSuccess(`Đã xóa người dùng "${deleteTarget.username}" thành công`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      showError('Xóa người dùng thất bại: ' + (err.message || err));
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN');
  };

  const columns: Column<UserResponse>[] = [
    {
      key: 'user',
      label: 'NGƯỜI DÙNG',
      render: (u) => {
        const self = isSelf(u);
        const roleUpper = String(u.role || 'CUSTOMER').toUpperCase();
        const roleColor = ROLE_LABEL[roleUpper]?.color || '#94A3B8';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 220 }}>
            <Avatar
              sx={{
                width: 42,
                height: 42,
                bgcolor: alpha(roleColor, 0.15),
                color: roleColor,
                fontWeight: 800,
                border: `1px solid ${alpha(roleColor, 0.3)}`,
              }}
            >
              {(u.full_name || u.username || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {u.full_name || u.username}
                </Typography>
                {self && (
                  <Chip
                    label="Tài khoản của bạn"
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                @{u.username} · ID: #{u.id}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      key: 'contact',
      label: 'LIÊN HỆ',
      render: (u) => (
        <Box>
          <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
            {u.email || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {u.phone || 'Chưa cập nhật SĐT'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'role',
      label: 'VAI TRÒ (RBAC)',
      align: 'center',
      render: (u) => {
        const roleKey = String(u.role || 'CUSTOMER').toUpperCase();
        const info = ROLE_LABEL[roleKey] || { label: roleKey, color: '#94A3B8' };
        return (
          <Chip
            size="small"
            label={info.label}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: alpha(info.color, 0.12),
              color: info.color,
              border: `1px solid ${alpha(info.color, 0.3)}`,
            }}
          />
        );
      },
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      align: 'center',
      render: (u) => (
        <StatusBadge status={Boolean(u.is_active)} category="user" size="small" />
      ),
    },
    {
      key: 'createdAt',
      label: 'NGÀY TẠO',
      align: 'center',
      render: (u) => (
        <Typography variant="caption" color="text.secondary">
          {formatDate(u.created_at)}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      align: 'right',
      render: (u) => {
        const self = isSelf(u);

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
            <Tooltip title="Xem đơn hàng của user">
              <IconButton
                size="small"
                onClick={() => navigate(`/admin/orders?userId=${u.id}`)}
              >
                <OrdersIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Chỉnh sửa thông tin">
              <IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/admin/users/${u.id}/edit`)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Lock / Unlock button */}
            <Tooltip title={self ? 'Không thể tự khóa tài khoản của bạn' : u.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
              <span>
                <IconButton
                  size="small"
                  disabled={self}
                  color={u.is_active ? 'warning' : 'success'}
                  onClick={() => setLockTarget(u)}
                >
                  {u.is_active ? <LockIcon fontSize="small" /> : <UnlockIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>

            {/* Delete button */}
            <Tooltip title={self ? 'Không thể tự xóa tài khoản của bạn' : 'Xóa người dùng'}>
              <span>
                <IconButton
                  size="small"
                  disabled={self}
                  color="error"
                  onClick={() => setDeleteTarget(u)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <MotionPage>
      <Box sx={{ pb: 4 }}>
        <DataTable<UserResponse>
          title="Quản lý người dùng & Phân quyền"
          subtitle={`Tổng số ${totalElements} tài khoản trong hệ thống`}
          columns={columns}
          data={users}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalElements}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Tìm kiếm theo username, họ tên, email..."
          actions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/users/create')}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Tạo tài khoản mới
            </Button>
          }
          filters={
            <>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Vai trò (Role)</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(0);
                  }}
                  label="Vai trò (Role)"
                >
                  <MenuItem value="">Tất cả vai trò</MenuItem>
                  <MenuItem value="ADMIN">Quản trị viên (ADMIN)</MenuItem>
                  <MenuItem value="STAFF">Nhân viên (STAFF)</MenuItem>
                  <MenuItem value="CUSTOMER">Khách hàng (CUSTOMER)</MenuItem>
                </Select>
              </FormControl>

              {(searchValue || roleFilter) && (
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
          emptyMessage="Không tìm thấy người dùng"
          emptyDescription="Không có tài khoản nào phù hợp với bộ lọc tìm kiếm hiện tại."
        />

        {/* Lock/Unlock Confirm Modal */}
        <ConfirmDialog
          open={Boolean(lockTarget)}
          title={lockTarget?.is_active ? 'Khóa tài khoản người dùng' : 'Mở khóa tài khoản người dùng'}
          message={
            lockTarget?.is_active
              ? `Bạn có chắc muốn khóa tài khoản người dùng "${lockTarget?.username}" không? Người dùng này sẽ bị từ chối đăng nhập vào hệ thống ngay lập tức.`
              : `Bạn có chắc muốn mở khóa cho tài khoản "${lockTarget?.username}" không? Người dùng sẽ có thể đăng nhập bình thường.`
          }
          itemName={`@${lockTarget?.username} (${lockTarget?.full_name || 'Người dùng'})`}
          confirmText={lockTarget?.is_active ? 'Khóa tài khoản' : 'Mở khóa ngay'}
          severity={lockTarget?.is_active ? 'warning' : 'info'}
          loading={locking}
          onConfirm={handleToggleLock}
          onCancel={() => setLockTarget(null)}
        />

        {/* Delete User Confirm Modal */}
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Xóa vĩnh viễn người dùng"
          message="Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản người dùng này không? Hành động này không thể hoàn tác."
          itemName={`@${deleteTarget?.username} (${deleteTarget?.full_name || 'Người dùng'})`}
          confirmText="Xóa vĩnh viễn"
          severity="error"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      </Box>
    </MotionPage>
  );
};

export default UsersList;
