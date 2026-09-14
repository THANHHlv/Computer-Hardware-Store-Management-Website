import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  alpha,
  ListSubheader,
  Avatar,
  Chip,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAppSelector, useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AuthState } from '../../types/auth.types';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'temporary' | 'permanent' | 'persistent';
  anchor?: 'left' | 'right';
}

interface SidebarItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles?: string[];
  badge?: string;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
  roles?: string[];
}

const SIDEBAR_WIDTH = 280;

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  variant = 'temporary',
  anchor = 'left',
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth) as AuthState;
  const userRoles = user?.role ? [String(user.role).toUpperCase()] : ['STAFF'];

  const hasRole = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.some((r) => userRoles.includes(r.toUpperCase()));
  };

  const sidebarGroups: SidebarGroup[] = [
    {
      title: 'TỔNG QUAN',
      items: [
        {
          text: 'Bảng điều khiển',
          icon: <DashboardRoundedIcon />,
          path: '/admin',
          roles: ['ADMIN', 'STAFF'],
        },
      ],
    },
    {
      title: 'KINH DOANH & BÁN HÀNG',
      items: [
        {
          text: 'Quản lý đơn hàng',
          icon: <ShoppingCartRoundedIcon />,
          path: '/admin/orders',
          roles: ['ADMIN', 'STAFF'],
        },
        {
          text: 'Chương trình khuyến mãi',
          icon: <LocalOfferRoundedIcon />,
          path: '/admin/promotions',
          roles: ['ADMIN', 'STAFF'],
        },
      ],
    },
    {
      title: 'KHO & SẢN PHẨM',
      items: [
        {
          text: 'Quản lý sản phẩm',
          icon: <Inventory2RoundedIcon />,
          path: '/admin/products',
          roles: ['ADMIN', 'STAFF'],
        },
        {
          text: 'Danh mục sản phẩm',
          icon: <CategoryRoundedIcon />,
          path: '/admin/categories',
          roles: ['ADMIN', 'STAFF'],
        },
        {
          text: 'Quản lý tồn kho',
          icon: <WarehouseRoundedIcon />,
          path: '/admin/inventory',
          roles: ['ADMIN', 'STAFF'],
        },
      ],
    },
    {
      title: 'HỆ THỐNG & QUẢN TRỊ',
      roles: ['ADMIN'],
      items: [
        {
          text: 'Quản lý người dùng',
          icon: <PeopleAltRoundedIcon />,
          path: '/admin/users',
          roles: ['ADMIN'],
        },
        {
          text: 'Báo cáo thống kê',
          icon: <BarChartRoundedIcon />,
          path: '/admin/reports',
          roles: ['ADMIN'],
        },
        {
          text: 'Cấu hình hệ thống',
          icon: <SettingsRoundedIcon />,
          path: '/admin/settings',
          roles: ['ADMIN'],
        },
      ],
    },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
    onClose();
  };

  const isItemActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const userRole = user?.role ? String(user.role).toUpperCase() : 'STAFF';
  const roleLabel = userRole === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên';

  const drawerContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      {/* Sidebar Header Brand */}
      <Box
        sx={{
          p: 2,
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'divider' : '#E5E7EB',
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: '#EE4D2D',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(238, 77, 45, 0.25)',
            flexShrink: 0,
          }}
        >
          PC
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, lineHeight: 1.2, color: 'text.primary' }}>
            PC Shop
          </Typography>
          <Chip
            label="Kênh Quản Trị"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(238, 77, 45, 0.2)' : '#FFF5F1',
              color: '#EE4D2D',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(238, 77, 45, 0.4)' : '#FCD4C9',
              mt: 0.3,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>
      </Box>

      {/* Navigation Groups */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1.5, px: 1.5 }}>
        {sidebarGroups.map((group) => {
          if (!hasRole(group.roles)) return null;

          const visibleItems = group.items.filter((item) => hasRole(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <Box key={group.title} sx={{ mb: 2 }}>
              <ListSubheader
                disableSticky
                sx={{
                  bgcolor: 'transparent',
                  lineHeight: '24px',
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: 'text.secondary',
                  px: 1.5,
                  mb: 0.5,
                }}
              >
                {group.title}
              </ListSubheader>

              <List disablePadding>
                {visibleItems.map((item) => {
                  const active = isItemActive(item.path);

                  return (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleItemClick(item.path)}
                        selected={active}
                        sx={{
                          borderRadius: '0 8px 8px 0',
                          py: 1.1,
                          px: 1.5,
                          transition: 'all 150ms ease',
                          '&.Mui-selected': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(238, 77, 45, 0.15)' : '#FFF5F1',
                            color: '#EE4D2D',
                            borderLeft: '4px solid #EE4D2D',
                            fontWeight: 700,
                            '& .MuiListItemIcon-root': {
                              color: '#EE4D2D',
                            },
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(238, 77, 45, 0.22)' : '#FFEAE4',
                            },
                          },
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 36,
                            color: active ? '#EE4D2D' : 'text.secondary',
                            transition: 'color 150ms ease',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: active ? 700 : 500,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      <Divider />

      {/* User Info & Logout Card at bottom */}
      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: userRole === 'ADMIN' ? '#EE4D2D' : '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.9rem',
              }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                {user?.full_name || 'Admin'}
              </Typography>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
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

          <ListItemButton
            onClick={handleLogout}
            sx={{
              width: 36,
              height: 36,
              p: 0,
              borderRadius: 2,
              justifyContent: 'center',
              color: 'error.main',
              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
            }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </ListItemButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      anchor={anchor}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: variant === 'persistent' && !open ? 0 : SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
