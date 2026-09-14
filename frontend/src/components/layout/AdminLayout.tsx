import React, { useState, useEffect } from 'react';
import {
  Box,
  useTheme,
  useMediaQuery,
  alpha,
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
} from '@mui/material';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
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
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(10, 14, 23, 0.92)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 2px 10px rgba(15, 23, 42, 0.05)',
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
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              borderRadius: 2,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: '#00F0FF',
                boxShadow: '0 0 10px #00F0FF',
                display: 'inline-block',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1rem', sm: '1.15rem' },
                letterSpacing: '-0.01em',
                background: 'linear-gradient(135deg, #00F0FF 0%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PC SHOP ADMIN
            </Typography>
          </Box>
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
                borderColor: theme.palette.divider,
                color: 'text.primary',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                },
              }}
            >
              Xem Website
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
                border: `1px solid ${theme.palette.divider}`,
                color: totalAlerts > 0 ? 'warning.main' : 'text.secondary',
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
              borderLeft: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: userRole === 'ADMIN' ? '#00F0FF' : '#10B981',
                color: '#0A0E17',
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
                  bgcolor: userRole === 'ADMIN' ? alpha('#00F0FF', 0.15) : alpha('#10B981', 0.15),
                  color: userRole === 'ADMIN' ? '#00F0FF' : '#10B981',
                  border: `1px solid ${userRole === 'ADMIN' ? alpha('#00F0FF', 0.3) : alpha('#10B981', 0.3)}`,
                  mt: 0.25,
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
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
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
              borderRadius: 2,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              border: `1px solid ${theme.palette.divider}`,
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
