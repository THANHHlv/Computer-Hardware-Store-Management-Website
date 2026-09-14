import React, { useState, useEffect } from 'react';
import {
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Avatar,
  Chip,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { AdminToast } from '../admin/AdminToast';
import { useAuth } from '../../hooks/useAuth';
import { adminDashboardService } from '../../services/admin.service';

interface AdminLayoutProps {
  children?: React.ReactNode;
  showBreadcrumbs?: boolean;
}

const DRAWER_WIDTH = 280;

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  showBreadcrumbs = true,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user, logout } = useAuth();

  // Notification state
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  useEffect(() => {
    // Fetch quick alert stats
    adminDashboardService.getDashboardStats().then((res: any) => {
      const pending = res?.pendingOrders ?? res?.pending_orders ?? 0;
      const lowStock = res?.lowStockProducts ?? res?.low_stock_products ?? 0;
      setPendingOrdersCount(pending);
      setLowStockCount(lowStock);
    }).catch(() => {
      // Non-fatal
    });
  }, []);

  const totalAlerts = pendingOrdersCount + (lowStockCount > 0 ? 1 : 0);

  // Global Search State
  const [globalSearch, setGlobalSearch] = useState('');
  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`/admin/orders?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const handleSidebarToggle = () => setSidebarOpen((s) => !s);
  const handleSidebarClose = () => setSidebarOpen(false);

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userRole = user?.role ? String(user.role).toUpperCase() : 'STAFF';
  const roleLabel = userRole === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#F6F8FA' }}>
      {/* Toast Notification Container */}
      <AdminToast />

      {/* Admin Header */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : '#FFFFFF',
          backdropFilter: 'blur(12px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'divider' : '#E5E7EB',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 1px 3px rgba(0, 0, 0, 0.05)',
          zIndex: theme.zIndex.drawer + 1,
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, md: 3 },
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Hamburger & Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleSidebarToggle}
            edge="start"
            aria-label="mở/đóng sidebar"
            sx={{
              color: 'text.primary',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
              borderRadius: 2,
              '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB' },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: '#EE4D2D',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.9rem',
                boxShadow: '0 2px 6px rgba(238, 77, 45, 0.3)',
              }}
            >
              PC
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '0.95rem', sm: '1.1rem' },
                letterSpacing: '-0.01em',
                color: 'text.primary',
              }}
            >
              Computer Shop
            </Typography>
            <Chip
              label="Kênh Quản Trị"
              size="small"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                height: 22,
                fontSize: '0.675rem',
                fontWeight: 700,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(238, 77, 45, 0.2)' : '#FFF5F1',
                color: '#EE4D2D',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(238, 77, 45, 0.4)' : '#FCD4C9',
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
          </Box>
        </Box>

        {/* Center: Global Search Bar (Amazon / Shopee style) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flex: 1, maxWidth: 420, mx: 3 }}>
          <TextField
            size="small"
            fullWidth
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={handleGlobalSearch}
            placeholder="Tìm đơn hàng, sản phẩm, khách hàng... (Enter)"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
              endAdornment: globalSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setGlobalSearch('')} edge="end">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F4F5F7',
                border: '1px solid transparent',
                fontSize: '0.8125rem',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#ECEEF1',
                },
                '&.Mui-focused': {
                  bgcolor: '#FFFFFF',
                  borderColor: '#EE4D2D',
                  boxShadow: '0 0 0 3px rgba(238, 77, 45, 0.12)',
                },
              },
            }}
          />
        </Box>

        {/* Right: Actions, Notifications, User Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {/* Link to Storefront */}
          <Tooltip title="Xem trang bán hàng">
            <Button
              component={RouterLink}
              to="/"
              target="_blank"
              variant="outlined"
              size="small"
              startIcon={<StorefrontOutlinedIcon />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.8125rem',
                borderColor: theme.palette.mode === 'dark' ? 'divider' : '#E5E7EB',
                color: 'text.primary',
                textTransform: 'none',
                bgcolor: theme.palette.mode === 'dark' ? 'transparent' : '#F9FAFB',
                '&:hover': {
                  borderColor: '#EE4D2D',
                  color: '#EE4D2D',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(238, 77, 45, 0.1)' : '#FFF5F1',
                },
              }}
            >
              Xem Cửa Hàng
            </Button>
          </Tooltip>

          {/* Notifications Bell */}
          <Tooltip title="Thông báo hệ thống">
            <IconButton
              onClick={handleNotifClick}
              size="small"
              sx={{
                p: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'divider' : '#E5E7EB',
                color: totalAlerts > 0 ? '#EE4D2D' : 'text.secondary',
                bgcolor: totalAlerts > 0 ? (theme.palette.mode === 'dark' ? 'rgba(238, 77, 45, 0.15)' : '#FFF5F1') : 'transparent',
              }}
            >
              <Badge badgeContent={totalAlerts} color="error">
                <NotificationsOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Popover/Card */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              pl: 1,
              borderLeft: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'divider' : '#E5E7EB',
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: userRole === 'ADMIN' ? '#EE4D2D' : '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.875rem',
              }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {user?.full_name || 'Quản trị viên'}
              </Typography>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  bgcolor: userRole === 'ADMIN' ? '#FFF7ED' : '#EFF6FF',
                  color: userRole === 'ADMIN' ? '#C2410C' : '#1E40AF',
                  border: '1px solid',
                  borderColor: userRole === 'ADMIN' ? '#FFEDD5' : '#DBEAFE',
                  mt: 0.25,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </Box>
          </Box>

          {/* Logout button */}
          <Tooltip title="Đăng xuất">
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                color: 'error.main',
                p: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'divider' : '#FEE2E2',
                bgcolor: theme.palette.mode === 'dark' ? 'transparent' : '#FEF2F2',
                '&:hover': { bgcolor: '#FEE2E2' },
              }}
            >
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notifAnchorEl)}
        anchorEl={notifAnchorEl}
        onClose={handleNotifClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              p: 1,
              borderRadius: 2.5,
              boxShadow: theme.palette.mode === 'dark' ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'divider' : '#E5E7EB',
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Thông báo hệ thống
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Các đầu việc cần quản trị viên chú ý
          </Typography>
        </Box>
        <Divider />
        <List dense sx={{ py: 0.5 }}>
          {pendingOrdersCount > 0 ? (
            <ListItem
              component={RouterLink}
              to="/admin/orders"
              onClick={handleNotifClose}
              sx={{
                borderRadius: 1.5,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'warning.main' }}>
                <ShoppingBagOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={`${pendingOrdersCount} đơn hàng chờ xử lý`}
                secondary="Cần xác nhận hoặc xử lý đóng gói"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ) : null}

          {lowStockCount > 0 ? (
            <ListItem
              component={RouterLink}
              to="/admin/inventory"
              onClick={handleNotifClose}
              sx={{
                borderRadius: 1.5,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
                <WarningAmberRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={`${lowStockCount} sản phẩm sắp hết hàng`}
                secondary="Tồn kho thấp hơn ngưỡng an toàn"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ) : null}

          {totalAlerts === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Không có cảnh báo tồn đọng. Hệ thống ổn định!
              </Typography>
            </Box>
          )}
        </List>
      </Popover>

      {/* Sidebar Navigation */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: {
            md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          },
          ml: {
            md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginTop: '64px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 2, pb: 0 }}>
            <Breadcrumbs />
          </Box>
        )}

        {/* Page Content Outlet */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1600,
            width: '100%',
            mx: 'auto',
          }}
        >
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
