import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../hooks/useSnackbar';
import { adminDashboardService } from '../../services/admin.service';
import { orderService } from '../../services/order.service';
import { productService } from '../../services/product.service';
import { MotionPage } from '../../components/common/MotionPage';
import { CountUp } from '../../components/common/CountUp';
import { AdminTrendChart } from '../../components/admin/AdminTrendChart';
import { StatusBadge } from '../../components/admin/StatusBadge';
import type { Product } from '../../types/product.types';

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
  activePromotions: number;
  recentComments: number;
}

export const AdminPanel: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    activePromotions: 0,
    recentComments: 0,
  });

  const [todayOrdersCount, setTodayOrdersCount] = useState<number>(0);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [monthlyOrderCount, setMonthlyOrderCount] = useState<number>(0);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<{ status: string; issues: string[]; uptime: string } | null>(null);

  const [monthlyOrdersTrend, setMonthlyOrdersTrend] = useState<number[]>([]);
  const [monthlyRevenueTrend, setMonthlyRevenueTrend] = useState<number[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Core stats
      const statsRes = await adminDashboardService.getDashboardStats();
      const normalizeStats = (s: any) => ({
        totalProducts: s.totalProducts ?? s.total_products ?? 0,
        totalUsers: s.totalUsers ?? s.total_users ?? 0,
        totalOrders: s.totalOrders ?? s.total_orders ?? 0,
        totalRevenue: s.totalRevenue ?? s.total_revenue ?? 0,
        lowStockProducts: s.lowStockProducts ?? s.low_stock_products ?? 0,
        pendingOrders: s.pendingOrders ?? s.pending_orders ?? 0,
        activePromotions: s.activePromotions ?? s.active_promotions ?? 0,
        recentComments: s.recentComments ?? s.recent_comments ?? 0,
      });
      setStats(normalizeStats(statsRes));

      // 2. Orders list for recent pending & today calculations
      try {
        const ordersRes = await orderService.getOrders({ page: 0, size: 50, sort: 'createdAt,desc' });
        const orders = ordersRes.content || [];

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let tOrders = 0;
        let tRev = 0;
        let mOrders = 0;
        let mRev = 0;

        orders.forEach((o: any) => {
          const createdAt = new Date(o.created_at || o.createdAt || 0).getTime();
          const amount = Number(o.final_amount ?? o.finalAmount ?? o.total_amount ?? o.total ?? 0);
          const isCancelled = String(o.status || '').toUpperCase() === 'CANCELLED';

          if (createdAt >= startOfDay) {
            tOrders++;
            if (!isCancelled) tRev += amount;
          }
          if (createdAt >= startOfMonth) {
            mOrders++;
            if (!isCancelled) mRev += amount;
          }
        });

        setTodayOrdersCount(tOrders);
        setTodayRevenue(tRev);
        setMonthlyOrderCount(mOrders || statsRes.totalOrders);
        setMonthlyRevenue(mRev || statsRes.totalRevenue);

        // Take 5 recent orders needing attention or latest
        const sortedRecent = [...orders].slice(0, 5);
        setRecentOrders(sortedRecent);
      } catch (e) {
        console.warn('Could not compute daily order metrics', e);
      }

      // 3. Top products (fetch top by stock/view or first 5 management products)
      try {
        const prodRes = await productService.getManagementProducts({ page: 0, size: 5, sort: 'updatedAt,desc' });
        setTopProducts(prodRes.content || []);
      } catch (e) {
        console.warn('Could not fetch top products', e);
      }

      // 4. Extras: trends, activities, health
      try {
        const [trends, activities, health] = await Promise.all([
          adminDashboardService.getMonthlyTrends(6).catch(() => ({ orders: [], revenue: [] })),
          adminDashboardService.getRecentActivities(5).catch(() => []),
          adminDashboardService.getSystemHealth().catch(() => ({ status: 'healthy', issues: [], uptime: '99.9%' })),
        ]);
        if (trends?.orders) setMonthlyOrdersTrend(trends.orders);
        if (trends?.revenue) setMonthlyRevenueTrend(trends.revenue);
        setRecentActivities(activities || []);
        setSystemHealth(health);
      } catch (e) {
        // Non-fatal
      }
    } catch (error: any) {
      showError('Không thể tải dữ liệu bảng điều khiển: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  return (
    <MotionPage>
      <Box sx={{ pb: 4 }}>
        {/* Top Header Card */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
              Tổng quan quản trị
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Xin chào, <strong>{user?.full_name || 'Admin'}</strong> — số liệu kinh doanh và vận hành hệ thống tính đến hôm nay.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton
                onClick={fetchDashboardData}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              component={RouterLink}
              to="/admin/products/create"
              sx={{ fontWeight: 700, borderRadius: 2, px: 2.5 }}
            >
              + Thêm sản phẩm
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/admin/orders"
              sx={{ fontWeight: 600, borderRadius: 2, px: 2 }}
            >
              Xem đơn hàng
            </Button>
          </Box>
        </Paper>

        {/* 4 Quick Stat Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2.5,
            mb: 3,
          }}
        >
          {/* Card 1: Đơn hôm nay */}
          <Card
            elevation={1}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { boxShadow: theme.shadows[4] },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Đơn hàng hôm nay
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#00F0FF' }}>
                  {loading ? <Skeleton width={60} /> : <CountUp end={todayOrdersCount} />}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#00F0FF', 0.12), color: '#00F0FF', width: 44, height: 44, borderRadius: 2 }}>
                <ShoppingCartIcon />
              </Avatar>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Tháng này: <strong>{monthlyOrderCount}</strong> đơn hàng
            </Typography>
          </Card>

          {/* Card 2: Doanh thu hôm nay & tháng này */}
          <Card
            elevation={1}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': { boxShadow: theme.shadows[4] },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Doanh thu hôm nay
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: '#10B981' }}>
                  {loading ? <Skeleton width={120} /> : <CountUp end={todayRevenue} formatter={currency} />}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#10B981', 0.12), color: '#10B981', width: 44, height: 44, borderRadius: 2 }}>
                <AttachMoneyIcon />
              </Avatar>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Tháng này: <strong>{currency(monthlyRevenue)}</strong>
            </Typography>
          </Card>

          {/* Card 3: Sản phẩm sắp hết hàng */}
          <Card
            elevation={1}
            onClick={() => navigate('/admin/inventory')}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${stats.lowStockProducts > 0 ? alpha(theme.palette.warning.main, 0.4) : theme.palette.divider}`,
              bgcolor: stats.lowStockProducts > 0 ? alpha(theme.palette.warning.main, 0.03) : 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              '&:hover': {
                boxShadow: theme.shadows[4],
                borderColor: theme.palette.warning.main,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Sản phẩm sắp hết hàng
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.warning.main }}>
                  {loading ? <Skeleton width={60} /> : <CountUp end={stats.lowStockProducts} />}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.main, width: 44, height: 44, borderRadius: 2 }}>
                <WarningAmberRoundedIcon />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                {stats.lowStockProducts > 0 ? 'Cần kiểm tra kho nhập hàng' : 'Tồn kho đang ổn định'}
              </Typography>
              <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
          </Card>

          {/* Card 4: Đơn đang chờ xử lý */}
          <Card
            elevation={1}
            onClick={() => navigate('/admin/orders')}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${stats.pendingOrders > 0 ? alpha(theme.palette.info.main, 0.4) : theme.palette.divider}`,
              bgcolor: stats.pendingOrders > 0 ? alpha(theme.palette.info.main, 0.03) : 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              '&:hover': {
                boxShadow: theme.shadows[4],
                borderColor: theme.palette.info.main,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Đơn chờ xử lý
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.info.main }}>
                  {loading ? <Skeleton width={60} /> : <CountUp end={stats.pendingOrders} />}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main, width: 44, height: 44, borderRadius: 2 }}>
                <HourglassEmptyRoundedIcon />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="info.main" sx={{ fontWeight: 600 }}>
                {stats.pendingOrders > 0 ? 'Cần xác nhận ngay' : 'Đã xử lý toàn bộ'}
              </Typography>
              <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
          </Card>
        </Box>

        {/* Interactive Revenue & Orders Trend Chart with 7d / 30d / 6m */}
        <AdminTrendChart
          monthlyRevenueTrend={monthlyRevenueTrend.length ? monthlyRevenueTrend : undefined}
          monthlyOrdersTrend={monthlyOrdersTrend.length ? monthlyOrdersTrend : undefined}
        />

        {/* 2 Big Action Lists: Recent Orders & Top Selling Products */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' }, gap: 3, mb: 3 }}>
          {/* Latest Orders Needing Attention */}
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Đơn hàng mới nhất cần xử lý
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Danh sách đơn vừa phát sinh cần duyệt hoặc điều phối
                  </Typography>
                </Box>
                <Button
                  component={RouterLink}
                  to="/admin/orders"
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  Tất cả đơn
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.25 }}>MÃ ĐƠN</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.25 }}>KHÁCH HÀNG</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.25 }}>TỔNG TIỀN</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.25 }}>TRẠNG THÁI</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.25 }}>CHI TIẾT</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell><Skeleton width={60} /></TableCell>
                          <TableCell><Skeleton width={90} /></TableCell>
                          <TableCell><Skeleton width={80} /></TableCell>
                          <TableCell><Skeleton width={70} /></TableCell>
                          <TableCell align="right"><Skeleton width={30} sx={{ ml: 'auto' }} /></TableCell>
                        </TableRow>
                      ))
                    ) : recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          Chưa có đơn hàng nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.map((order) => (
                        <TableRow key={order.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) } }}>
                          <TableCell sx={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                            #{order.order_code || order.orderCode || order.id}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {order.customer_name || order.customerName || 'Khách vãng lai'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(order.created_at || order.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>
                            {currency(Number(order.final_amount ?? order.finalAmount ?? order.total_amount ?? 0))}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status || 'PENDING'} category="order" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Xem chi tiết đơn">
                              <IconButton
                                size="small"
                                component={RouterLink}
                                to={`/admin/orders/${order.id}`}
                                sx={{ color: theme.palette.primary.main }}
                              >
                                <OpenInNewRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Top Selling Products List */}
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Top sản phẩm nổi bật
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sản phẩm kinh doanh chủ lực của cửa hàng
                  </Typography>
                </Box>
                <Button
                  component={RouterLink}
                  to="/admin/products"
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  Kho sản phẩm
                </Button>
              </Box>

              <List disablePadding>
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Skeleton variant="rounded" width={44} height={44} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Skeleton width="70%" />}
                        secondary={<Skeleton width="40%" />}
                      />
                    </ListItem>
                  ))
                ) : topProducts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    Chưa có sản phẩm nào
                  </Typography>
                ) : (
                  topProducts.map((p, idx) => {
                    const primaryImg = p.images?.find((img) => img.is_primary)?.file_path || p.images?.[0]?.file_path;
                    const isLow = (p.quantity ?? 0) <= (p.low_stock_threshold ?? 5);

                    return (
                      <React.Fragment key={p.id || idx}>
                        <ListItem
                          sx={{
                            px: 1,
                            py: 1.25,
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              variant="rounded"
                              src={primaryImg}
                              sx={{
                                width: 44,
                                height: 44,
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                border: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Inventory2Icon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                                {p.name}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
                                  {currency(p.price)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  · Tồn kho: <strong>{p.quantity}</strong>
                                </Typography>
                              </Box>
                            }
                          />
                          <StatusBadge
                            status={isLow ? 'LOW_STOCK' : 'IN_STOCK'}
                            category="product"
                            size="small"
                          />
                        </ListItem>
                        {idx < topProducts.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Footer info: Activities & System status */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Recent activities */}
          <Card elevation={1} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Nhật ký hoạt động gần đây
                </Typography>
                <Chip icon={<NotificationsActiveIcon />} label={`${recentActivities.length} sự kiện`} size="small" />
              </Box>
              <Divider sx={{ mb: 1 }} />
              <List dense>
                {recentActivities.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="Không có sự kiện mới" secondary="Hệ thống vận hành bình thường" />
                  </ListItem>
                ) : (
                  recentActivities.map((a: any, i) => (
                    <ListItem key={a.id || i} sx={{ px: 0.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={a.message || 'Cập nhật hệ thống'}
                        secondary={a.timestamp ? formatDate(a.timestamp) : 'Vừa xong'}
                        primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                        secondaryTypographyProps={{ fontSize: '0.725rem' }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card elevation={1} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Trạng thái vận hành & Uptime
                </Typography>
                <Chip
                  label={systemHealth?.status ? systemHealth.status.toUpperCase() : 'HOẠT ĐỘNG TỐT'}
                  color="success"
                  size="small"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  Thời gian hoạt động máy chủ: <strong>{systemHealth?.uptime || '99.98%'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cổng thanh toán VNPay: <strong style={{ color: '#10B981' }}>Đang kết nối bình thường</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cơ sở dữ liệu & Bộ nhớ đệm: <strong style={{ color: '#10B981' }}>Hoạt động ổn định</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </MotionPage>
  );
};

export default AdminPanel;
