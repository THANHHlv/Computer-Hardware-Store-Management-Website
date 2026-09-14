import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Alert,
  FormHelperText,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBackRounded as BackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../../services/user.service';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useAuth } from '../../../hooks/useAuth';
import type { UserResponse } from '../../../types/auth.types';
import { MotionPage } from '../../../components/common/MotionPage';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}

export const UserForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { showError, showSuccess } = useSnackbar();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadedUser, setLoadedUser] = useState<UserResponse | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'CUSTOMER',
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  // Confirm dialog when promoting to ADMIN
  const [confirmAdminOpen, setConfirmAdminOpen] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      (async () => {
        try {
          const userData = await userService.getUserById(parseInt(id));
          setLoadedUser(userData);
          setFormData({
            username: userData?.username || '',
            email: userData?.email || '',
            password: '',
            fullName: userData?.full_name || '',
            phone: userData?.phone || '',
            address: userData?.address || '',
            role: (userData?.role as 'CUSTOMER' | 'STAFF' | 'ADMIN') || 'CUSTOMER',
          });
        } catch (error: any) {
          showError('Không thể tải thông tin người dùng: ' + error.message);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, isEdit, showError]);

  const isEditingSelf = Boolean(
    currentUser &&
    loadedUser &&
    ((currentUser.id && loadedUser.id && currentUser.id === loadedUser.id) ||
      (currentUser.username && loadedUser.username && currentUser.username === loadedUser.username))
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'Mật khẩu khởi tạo không được để trống';
    } else if (!isEdit && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu đổi mới phải có ít nhất 6 ký tự';
    }

    if (formData.phone && !/^[0-9+\-\s()]*$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeSave = async () => {
    setSaving(true);
    try {
      if (isEdit && id) {
        const updatePayload: any = {
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          role: formData.role,
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }

        await userService.updateUser(parseInt(id), updatePayload);
        showSuccess('Cập nhật người dùng thành công!');
      } else {
        await userService.createUser({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          role: formData.role,
        });
        showSuccess('Tạo tài khoản người dùng mới thành công!');
      }
      navigate('/admin/users');
    } catch (error: any) {
      showError('Lưu người dùng thất bại: ' + (error.message || error));
    } finally {
      setSaving(false);
      setConfirmAdminOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError('Vui lòng kiểm tra lại thông tin có báo lỗi');
      return;
    }

    // If promoting to ADMIN from non-admin, trigger confirmation modal
    const originalRole = loadedUser?.role;
    if (formData.role === 'ADMIN' && originalRole !== 'ADMIN') {
      setConfirmAdminOpen(true);
      return;
    }

    executeSave();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MotionPage>
      <Box sx={{ pb: 6, maxWidth: 960, mx: 'auto' }}>
        {/* Header toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate('/admin/users')}
              sx={{ borderRadius: 2 }}
            >
              Danh sách
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo mới tài khoản'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={saving}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo tài khoản'}
          </Button>
        </Box>

        {isEditingSelf && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Bạn đang chỉnh sửa <strong>tài khoản của chính mình</strong>. Để đảm bảo an toàn hệ thống, bạn không thể tự hạ vai trò quản trị viên của mình.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Thông tin chi tiết người dùng
            </Typography>

            <Stack spacing={3}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Tên đăng nhập (Username)"
                  required
                  disabled={isEdit}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  error={Boolean(errors.username)}
                  helperText={errors.username || (isEdit ? 'Tên đăng nhập không thể thay đổi sau khi tạo' : undefined)}
                />

                <TextField
                  fullWidth
                  label="Họ và tên đầy đủ"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Địa chỉ Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  placeholder="user@example.com"
                />

                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  placeholder="0912345678"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <TextField
                  fullWidth
                  type="password"
                  label={isEdit ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu khởi tạo'}
                  required={!isEdit}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={Boolean(errors.password)}
                  helperText={errors.password || (isEdit ? 'Chỉ nhập nếu bạn muốn đặt lại mật khẩu cho người dùng này' : 'Tối thiểu 6 ký tự')}
                />

                <FormControl fullWidth required>
                  <InputLabel>Vai trò hệ thống (RBAC)</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    label="Vai trò hệ thống (RBAC)"
                    disabled={isEditingSelf}
                  >
                    <MenuItem value="CUSTOMER">Khách hàng (CUSTOMER)</MenuItem>
                    <MenuItem value="STAFF">Nhân viên (STAFF)</MenuItem>
                    <MenuItem value="ADMIN">Quản trị viên cấp cao (ADMIN)</MenuItem>
                  </Select>
                  {isEditingSelf && (
                    <FormHelperText>Bạn không thể tự đổi vai trò của tài khoản đang đăng nhập</FormHelperText>
                  )}
                </FormControl>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Địa chỉ liên hệ / Giao hàng"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
              />
            </Stack>
          </Paper>
        </form>

        {/* Promote to ADMIN confirmation dialog */}
        <ConfirmDialog
          open={confirmAdminOpen}
          title="Xác nhận cấp quyền Quản trị viên (ADMIN)"
          message="Vai trò Quản trị viên (ADMIN) có toàn quyền cao nhất: xóa sản phẩm, can thiệp kho, quản lý tài khoản người dùng khác và xem báo cáo tài chính. Bạn có chắc chắn muốn trao quyền này?"
          itemName={`@${formData.username} (${formData.fullName})`}
          confirmText="Xác nhận cấp quyền ADMIN"
          severity="warning"
          loading={saving}
          onConfirm={executeSave}
          onCancel={() => setConfirmAdminOpen(false)}
        />
      </Box>
    </MotionPage>
  );
};

export default UserForm;