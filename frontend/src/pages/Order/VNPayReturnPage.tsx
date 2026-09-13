import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Stack,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ReplayIcon from '@mui/icons-material/Replay';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { MotionPage } from '../../components/common/MotionPage';
import { api } from '../../services/api';

/**
 * Trang kết quả thanh toán VNPay.
 * VNPay redirect khách về URL này sau khi thanh toán.
 * 
 * Hiển thị trạng thái dựa trên query params, nhưng fetch lại order từ API
 * để lấy trạng thái thật (vì IPN mới là nguồn tin cậy).
 */

type OrderData = {
  id?: number;
  order_code?: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  final_amount?: number;
  vnpay_transaction_no?: string;
};

const formatCurrency = (value?: number) =>
  `${Number(value ?? 0).toLocaleString('vi-VN')} VND`;

const VNPay_RESPONSE_CODES: Record<string, string> = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
  '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
  '12': 'Thẻ/Tài khoản bị khóa',
  '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
  '24': 'Khách hàng hủy giao dịch',
  '51': 'Tài khoản không đủ số dư để thực hiện giao dịch',
  '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
  '75': 'Ngân hàng thanh toán đang bảo trì',
  '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định',
  '99': 'Lỗi không xác định',
};

const VNPayReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Đọc params từ URL
  const vnpResponseCode = searchParams.get('vnp_ResponseCode') || '';
  const vnpTxnRef = searchParams.get('vnp_TxnRef') || '';
  const vnpTransactionNo = searchParams.get('vnp_TransactionNo') || '';
  const vnpAmount = searchParams.get('vnp_Amount') || '0';

  // Trạng thái hiển thị dựa trên query params (tham khảo)
  const urlIndicatesSuccess = vnpResponseCode === '00';

  // Số tiền (VNPay trả về đơn vị xu, chia 100)
  const displayAmount = useMemo(() => {
    const raw = parseInt(vnpAmount, 10);
    return isNaN(raw) ? 0 : raw / 100;
  }, [vnpAmount]);

  // Fetch trạng thái order thật từ API
  useEffect(() => {
    if (!vnpTxnRef) {
      setLoading(false);
      setFetchError('Không tìm thấy mã đơn hàng trong URL');
      return;
    }

    let cancelled = false;
    const fetchOrder = async () => {
      // Retry vài lần vì IPN có thể chưa xử lý xong
      let retries = 3;
      let lastError: string | null = null;

      while (retries > 0 && !cancelled) {
        try {
          const resp = await api.get<any>(`/orders/code/${vnpTxnRef}`);
          if (cancelled) return;
          const data = resp?.data?.data || resp?.data || resp;
          setOrderData(data);
          setFetchError(null);
          setLoading(false);
          return;
        } catch (e: any) {
          lastError = e?.response?.data?.message || e?.message || 'Không thể tải thông tin đơn hàng';
          retries--;
          if (retries > 0 && !cancelled) {
            // Đợi 2 giây trước khi retry (chờ IPN xử lý)
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }

      if (!cancelled) {
        setFetchError(lastError);
        setLoading(false);
      }
    };

    fetchOrder();
    return () => { cancelled = true; };
  }, [vnpTxnRef]);

  // Trạng thái thật: ưu tiên dữ liệu từ API, fallback query params
  const isActuallyPaid = orderData?.payment_status === 'PAID';
  const isSuccess = isActuallyPaid || (loading && urlIndicatesSuccess);

  const responseMessage = vnpResponseCode
    ? (VNPay_RESPONSE_CODES[vnpResponseCode] || `Mã phản hồi: ${vnpResponseCode}`)
    : 'Không xác định trạng thái giao dịch';

  if (loading) {
    return (
      <MotionPage>
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 5,
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <CircularProgress size={48} sx={{ mb: 3 }} />
            <Typography variant="h6" fontWeight={600}>
              Đang xác nhận thanh toán...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Vui lòng chờ trong giây lát, hệ thống đang xác minh giao dịch với VNPay.
            </Typography>
          </Paper>
        </Container>
      </MotionPage>
    );
  }

  return (
    <MotionPage>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            textAlign: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Gradient accent bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: isSuccess
                ? 'linear-gradient(90deg, #10B981, #34D399, #6EE7B7)'
                : 'linear-gradient(90deg, #EF4444, #F87171, #FCA5A5)',
            }}
          />

          {/* Icon */}
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              background: isSuccess
                ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.08))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(248,113,113,0.08))',
              animation: 'scaleIn 0.5s ease-out',
              '@keyframes scaleIn': {
                '0%': { transform: 'scale(0)', opacity: 0 },
                '60%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          >
            {isSuccess ? (
              <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#10B981' }} />
            ) : (
              <ErrorOutlineIcon sx={{ fontSize: 48, color: '#EF4444' }} />
            )}
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: isSuccess ? '#10B981' : '#EF4444',
              mb: 1,
            }}
          >
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán không thành công'}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {responseMessage}
          </Typography>

          {/* Order details */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              textAlign: 'left',
              mb: 3,
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Mã đơn hàng</Typography>
                <Typography fontWeight={600}>{vnpTxnRef || '—'}</Typography>
              </Stack>

              {vnpTransactionNo && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Mã giao dịch VNPay</Typography>
                  <Typography fontWeight={500} sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {vnpTransactionNo}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Số tiền</Typography>
                <Typography fontWeight={700} color="primary.main" variant="h6">
                  {formatCurrency(displayAmount)}
                </Typography>
              </Stack>

              {orderData && (
                <>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Trạng thái đơn hàng</Typography>
                    <Chip
                      size="small"
                      label={orderData.status || 'PENDING'}
                      color={
                        orderData.status === 'CONFIRMED' ? 'success'
                          : orderData.status === 'CANCELLED' ? 'error'
                            : 'warning'
                      }
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Trạng thái thanh toán</Typography>
                    <Chip
                      size="small"
                      label={orderData.payment_status || 'PENDING'}
                      color={
                        orderData.payment_status === 'PAID' ? 'success'
                          : orderData.payment_status === 'FAILED' ? 'error'
                            : 'warning'
                      }
                    />
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>

          {fetchError && (
            <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
              ⚠️ {fetchError} — trạng thái hiển thị có thể chưa cập nhật, vui lòng kiểm tra lại sau.
            </Typography>
          )}

          {/* Action buttons */}
          <Stack spacing={1.5}>
            {orderData?.id && (
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ReceiptLongIcon />}
                onClick={() => navigate(`/order/${orderData.id}`)}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Xem chi tiết đơn hàng
              </Button>
            )}

            {!isSuccess && orderData?.id && (
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<ReplayIcon />}
                onClick={() => {
                  // Redirect to retry payment (will call create payment URL again)
                  window.location.href = `/order/${orderData.id}`;
                }}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Thử lại thanh toán
              </Button>
            )}

            <Button
              variant="text"
              fullWidth
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate('/products')}
              sx={{ fontWeight: 500 }}
            >
              Tiếp tục mua sắm
            </Button>
          </Stack>
        </Paper>
      </Container>
    </MotionPage>
  );
};

export default VNPayReturnPage;
