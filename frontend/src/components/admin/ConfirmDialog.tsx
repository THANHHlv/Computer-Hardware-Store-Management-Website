import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string | React.ReactNode;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  severity?: 'error' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Xác nhận hành động',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này không? Thao tác này có thể không thể hoàn tác.',
  itemName,
  confirmText,
  cancelText = 'Hủy bỏ',
  onConfirm,
  onCancel,
  loading = false,
  severity = 'error',
}) => {
  const theme = useTheme();

  const getColorConfig = () => {
    switch (severity) {
      case 'error':
        return {
          main: theme.palette.error.main,
          light: alpha(theme.palette.error.main, 0.1),
          btnColor: 'error' as const,
          defaultConfirmText: 'Xóa vĩnh viễn',
          icon: <DeleteOutlineRoundedIcon sx={{ fontSize: 28, color: theme.palette.error.main }} />,
        };
      case 'warning':
        return {
          main: theme.palette.warning.main,
          light: alpha(theme.palette.warning.main, 0.1),
          btnColor: 'warning' as const,
          defaultConfirmText: 'Xác nhận thực hiện',
          icon: <WarningAmberRoundedIcon sx={{ fontSize: 28, color: theme.palette.warning.main }} />,
        };
      case 'info':
      default:
        return {
          main: theme.palette.primary.main,
          light: alpha(theme.palette.primary.main, 0.1),
          btnColor: 'primary' as const,
          defaultConfirmText: 'Đồng ý',
          icon: <InfoOutlinedIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />,
        };
    }
  };

  const config = getColorConfig();
  const finalConfirmText = confirmText || config.defaultConfirmText;

  const handleConfirmClick = async () => {
    try {
      await onConfirm();
    } catch {
      // Handled by parent caller
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            boxShadow: theme.palette.mode === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 12px 28px rgba(15, 23, 42, 0.12)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'divider' : '#E5E7EB',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: config.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {config.icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onCancel}
          disabled={loading}
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: itemName ? 1.5 : 0 }}>
          {message}
        </Typography>

        {itemName && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(config.main, 0.08),
              border: `1px dashed ${alpha(config.main, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Đối tượng:
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: config.main, wordBreak: 'break-word' }}
            >
              {itemName}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 2.5,
            fontWeight: 600,
            borderColor: 'divider',
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={config.btnColor}
          onClick={handleConfirmClick}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 700,
            boxShadow: `0 4px 14px ${alpha(config.main, 0.4)}`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(config.main, 0.6)}`,
            },
          }}
        >
          {loading ? 'Đang xử lý...' : finalConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
