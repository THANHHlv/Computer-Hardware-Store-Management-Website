import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBackRounded as BackIcon,
  LocalOfferRounded as VoucherIcon,
  CheckCircleOutlineRounded as CheckIcon,
  AccessTimeRounded as TimeIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { promotionService } from '../../../services/promotion.service';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { MotionPage } from '../../../components/common/MotionPage';

export const PromotionForm: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useSnackbar();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    minimum_order_amount: 0,
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      (async () => {
        try {
          const data = await promotionService.getPromotionById(Number(id));
          const mapped = {
            name: data.name ?? (data as any)?.title ?? '',
            description: data.description ?? (data as any)?.desc ?? '',
            discount_type: (data as any).discount_type ?? (data as any).discountType ?? 'PERCENTAGE',
            discount_value: Number((data as any).discount_value ?? (data as any).discountValue ?? 0),
            minimum_order_amount: Number((data as any).minimum_order_amount ?? (data as any).minimumOrderAmount ?? 0),
            start_date: (data as any).start_date ?? (data as any).startDate ?? '',
            end_date: (data as any).end_date ?? (data as any).endDate ?? '',
            is_active: (data as any).is_active ?? (data as any).isActive ?? true,
          };
          setForm(mapped);
        } catch {
          showError('Không thể tải thông tin khuyến mãi');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // Default dates: today -> 30 days later
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(now.getDate() + 30);
      setForm((prev: any) => ({
        ...prev,
        start_date: now.toISOString().slice(0, 16),
        end_date: nextMonth.toISOString().slice(0, 16),
      }));
    }
  }, [id, isEdit, showError]);

  const handleChange = (key: string) => (e: any) => {
    setForm((prev: any) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) {
      setErrors((err) => {
        const next = { ...err };
        delete next[key];
        return next;
      });
    }
  };

  const handleBooleanChange = (key: string) => (_: any, checked: boolean) => {
    setForm((prev: any) => ({ ...prev, [key]: checked }));
  };

  const normalizeDateForBackend = (v: string, isEnd = false) => {
    if (!v) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return isEnd ? `${v}T23:59:59` : `${v}T00:00:00`;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return `${v}:00`;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(v)) return v;
    try {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d.toISOString().replace(/\.\d{3}Z$/, '');
    } catch {
      // Non-fatal
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name || !form.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên chương trình khuyến mãi';
    }

    const val = Number(form.discount_value ?? 0);
    if (form.discount_type === 'PERCENTAGE') {
      if (isNaN(val) || val <= 0 || val > 100) {
        newErrors.discount_value = 'Mức giảm phần trăm phải từ 1% đến 100%';
      }
    } else {
      if (isNaN(val) || val <= 0) {
        newErrors.discount_value = 'Số tiền giảm cố định phải lớn hơn 0 VNĐ';
      }
    }

    if (Number(form.minimum_order_amount ?? 0) < 0) {
      newErrors.minimum_order_amount = 'Đơn hàng tối thiểu không được âm';
    }

    if (!form.start_date) {
      newErrors.start_date = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!form.end_date) {
      newErrors.end_date = 'Vui lòng chọn ngày kết thúc';
    } else if (form.start_date) {
      const startMs = new Date(form.start_date).getTime();
      const endMs = new Date(form.end_date).getTime();
      if (endMs <= startMs) {
        newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError('Vui lòng kiểm tra lại các trường thông tin có viền đỏ.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || '',
        discount_value: Number(form.discount_value),
        minimum_order_amount: Number(form.minimum_order_amount || 0),
        start_date: normalizeDateForBackend(form.start_date, false),
        end_date: normalizeDateForBackend(form.end_date, true),
      };

      if (isEdit && id) {
        await promotionService.updatePromotion(Number(id), payload);
        showSuccess('Cập nhật chương trình khuyến mãi thành công!');
      } else {
        await promotionService.createPromotion(payload);
        showSuccess('Tạo mới chương trình khuyến mãi thành công!');
      }
      navigate('/admin/promotions');
    } catch (err: any) {
      showError('Lưu khuyến mãi thất bại: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const currency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
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
      <Box sx={{ pb: 6 }}>
        {/* Top header bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate('/admin/promotions')}
              sx={{ borderRadius: 2 }}
            >
              Danh sách
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {isEdit ? 'Chỉnh sửa khuyến mãi' : 'Tạo mới khuyến mãi'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={saving}
            sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
          >
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật khuyến mãi' : 'Lưu khuyến mãi'}
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column: Form Fields */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Thông tin thiết lập chương trình
                </Typography>

                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Tên chương trình khuyến mãi"
                    required
                    value={form.name}
                    onChange={handleChange('name')}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    placeholder="Ví dụ: Giảm giá mùa tựu trường, Flash Sale linh kiện"
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Mô tả chi tiết"
                    value={form.description}
                    onChange={handleChange('description')}
                    placeholder="Điều kiện và phạm vi áp dụng của mã ưu đãi..."
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Loại hình giảm giá</InputLabel>
                        <Select
                          value={form.discount_type}
                          onChange={handleChange('discount_type')}
                          label="Loại hình giảm giá"
                        >
                          <MenuItem value="PERCENTAGE">Giảm theo phần trăm (%)</MenuItem>
                          <MenuItem value="FIXED_AMOUNT">Giảm số tiền cố định (VNĐ)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={form.discount_type === 'PERCENTAGE' ? 'Mức giảm (%)' : 'Số tiền giảm (VNĐ)'}
                        required
                        value={form.discount_value}
                        onChange={handleChange('discount_value')}
                        error={Boolean(errors.discount_value)}
                        helperText={errors.discount_value}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Giá trị đơn hàng tối thiểu (VNĐ)"
                    value={form.minimum_order_amount}
                    onChange={handleChange('minimum_order_amount')}
                    error={Boolean(errors.minimum_order_amount)}
                    helperText={errors.minimum_order_amount || 'Đặt bằng 0 nếu áp dụng cho mọi đơn hàng'}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="datetime-local"
                        label="Ngày bắt đầu hiệu lực"
                        required
                        value={form.start_date ? form.start_date.slice(0, 16) : ''}
                        onChange={handleChange('start_date')}
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(errors.start_date)}
                        helperText={errors.start_date}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="datetime-local"
                        label="Ngày kết thúc hiệu lực"
                        required
                        value={form.end_date ? form.end_date.slice(0, 16) : ''}
                        onChange={handleChange('end_date')}
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(errors.end_date)}
                        helperText={errors.end_date}
                      />
                    </Grid>
                  </Grid>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(form.is_active)}
                        onChange={handleBooleanChange('is_active')}
                        color="success"
                      />
                    }
                    label="Kích hoạt áp dụng chương trình ngay"
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* Right Column: Live Preview Voucher Card */}
            <Grid item xs={12} md={5}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  position: 'sticky',
                  top: 88,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Xem trước phiếu ưu đãi (Live Preview)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                  Giao diện hiển thị thực tế khi khách hàng nhìn thấy ưu đãi này
                </Typography>

                {/* Ticket / Voucher Card */}
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 2.5,
                    border: '1px dashed #10B981',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 240, 255, 0.05) 100%)',
                    overflow: 'hidden',
                    mb: 2.5,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Chip
                        icon={<VoucherIcon />}
                        label="ƯU ĐÃI ĐẶC BIỆT"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={form.is_active ? 'ĐANG BẬT' : 'TẠM TẮT'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.675rem',
                          bgcolor: form.is_active ? alpha('#10B981', 0.2) : alpha('#94A3B8', 0.2),
                          color: form.is_active ? '#10B981' : 'text.secondary',
                        }}
                      />
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#10B981', fontFamily: 'JetBrains Mono, monospace', mb: 0.5 }}>
                      {form.discount_type === 'PERCENTAGE'
                        ? `-${form.discount_value || 0}%`
                        : `-${currency(Number(form.discount_value || 0))}`}
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1 }}>
                      {form.name || 'Tên chương trình ưu đãi'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 36 }}>
                      {form.description || 'Chưa có thông tin mô tả chi tiết cho khuyến mãi này.'}
                    </Typography>

                    <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                    <Stack spacing={0.75}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon sx={{ fontSize: 16, color: '#10B981' }} />
                        <Typography variant="caption" color="text.secondary">
                          Đơn tối thiểu:{' '}
                          <strong style={{ color: theme.palette.text.primary }}>
                            {Number(form.minimum_order_amount) > 0
                              ? currency(Number(form.minimum_order_amount))
                              : 'Mọi đơn hàng'}
                          </strong>
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                        <Typography variant="caption" color="text.secondary">
                          Hiệu lực: {formatDateDisplay(form.start_date)} → {formatDateDisplay(form.end_date)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.info.main, 0.06),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    💡 Khách hàng khi thỏa mãn điều kiện đơn hàng tối thiểu sẽ tự động được gợi ý áp dụng voucher này khi thanh toán.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </Box>
    </MotionPage>
  );
};

export default PromotionForm;
