import React, { useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Stack, Button, useTheme, ButtonGroup } from '@mui/material';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

export interface AdminTrendChartProps {
  monthlyRevenueTrend?: number[];
  monthlyOrdersTrend?: number[];
  months?: string[];
  sevenDaysRevenue?: number[];
  sevenDaysOrders?: number[];
  sevenDaysLabels?: string[];
  thirtyDaysRevenue?: number[];
  thirtyDaysOrders?: number[];
  thirtyDaysLabels?: string[];
}

export const AdminTrendChart: React.FC<AdminTrendChartProps> = ({
  monthlyRevenueTrend = [45000000, 68000000, 82000000, 75000000, 95000000, 120000000],
  monthlyOrdersTrend = [35, 52, 64, 58, 76, 94],
  months = ['T4', 'T5', 'T6', 'T7', 'T8', 'T9'],
  sevenDaysRevenue,
  sevenDaysOrders,
  sevenDaysLabels,
  thirtyDaysRevenue,
  thirtyDaysOrders,
  thirtyDaysLabels,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const shouldReduceMotion = useReducedMotion();
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders'>('revenue');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '6m'>('7d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fallback data for 7d and 30d if not provided
  const fallback7dLabels = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(`${d.getDate()}/${d.getMonth() + 1}`);
    }
    return days;
  }, []);

  const fallback30dLabels = useMemo(() => {
    const weeks = [];
    for (let i = 4; i >= 0; i--) {
      weeks.push(`Tuần -${i}`);
    }
    return weeks;
  }, []);

  // Compute active dataset based on metric & timeframe
  const currentDataset = useMemo(() => {
    if (timeRange === '7d') {
      const rev = sevenDaysRevenue && sevenDaysRevenue.length >= 7
        ? sevenDaysRevenue
        : [12000000, 18500000, 14200000, 22000000, 19800000, 28500000, 31000000];
      const ord = sevenDaysOrders && sevenDaysOrders.length >= 7
        ? sevenDaysOrders
        : [8, 14, 11, 16, 13, 20, 24];
      const labels = sevenDaysLabels || fallback7dLabels;
      return {
        data: activeMetric === 'revenue' ? rev : ord,
        labels,
      };
    }

    if (timeRange === '30d') {
      const rev = thirtyDaysRevenue && thirtyDaysRevenue.length >= 5
        ? thirtyDaysRevenue
        : [65000000, 78000000, 89000000, 92000000, 108000000];
      const ord = thirtyDaysOrders && thirtyDaysOrders.length >= 5
        ? thirtyDaysOrders
        : [45, 58, 62, 70, 85];
      const labels = thirtyDaysLabels || fallback30dLabels;
      return {
        data: activeMetric === 'revenue' ? rev : ord,
        labels,
      };
    }

    // 6m
    return {
      data: activeMetric === 'revenue' ? monthlyRevenueTrend : monthlyOrdersTrend,
      labels: months,
    };
  }, [
    timeRange,
    activeMetric,
    sevenDaysRevenue,
    sevenDaysOrders,
    sevenDaysLabels,
    thirtyDaysRevenue,
    thirtyDaysOrders,
    thirtyDaysLabels,
    monthlyRevenueTrend,
    monthlyOrdersTrend,
    months,
    fallback7dLabels,
    fallback30dLabels,
  ]);

  const { data, labels } = currentDataset;
  const isRevenue = activeMetric === 'revenue';
  const strokeColor = isRevenue ? theme.palette.primary.main : '#10B981';

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  // Chart dimensions
  const width = 640;
  const height = 220;
  const padX = 40;
  const padY = 30;

  const points = data.map((val, idx) => {
    const x = padX + (idx / (data.length - 1 || 1)) * (width - padX * 2);
    const y = height - padY - ((val - minVal) / range) * (height - padY * 2);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = points[idx - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`
    : '';

  const formatVal = (v: number) => {
    if (isRevenue) {
      if (v >= 1000000000) return (v / 1000000000).toFixed(1) + ' tỷ ₫';
      if (v >= 1000000) return (v / 1000000).toFixed(1) + ' tr ₫';
      return (v / 1000).toFixed(0) + ' k ₫';
    }
    return v.toLocaleString('vi-VN') + ' đơn';
  };

  return (
    <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <TrendingUp size={18} color={strokeColor} />
              <Typography variant="overline" sx={{ color: strokeColor, fontWeight: 700, letterSpacing: 1 }}>
                XU HƯỚNG TĂNG TRƯỞNG & DOANH SỐ
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {isRevenue ? 'Biểu Đồ Doanh Thu' : 'Biểu Đồ Số Lượng Đơn Hàng'}{' '}
              <Typography component="span" variant="h5" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                ({timeRange === '7d' ? '7 ngày qua' : timeRange === '30d' ? '30 ngày qua' : '6 tháng gần nhất'})
              </Typography>
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
            {/* Timeframe switch */}
            <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: 2 }}>
              <Button
                onClick={() => setTimeRange('7d')}
                variant={timeRange === '7d' ? 'contained' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  bgcolor: timeRange === '7d' ? theme.palette.primary.main : 'transparent',
                  color: timeRange === '7d' ? '#0A0E17' : 'text.secondary',
                }}
              >
                7 ngày
              </Button>
              <Button
                onClick={() => setTimeRange('30d')}
                variant={timeRange === '30d' ? 'contained' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  bgcolor: timeRange === '30d' ? theme.palette.primary.main : 'transparent',
                  color: timeRange === '30d' ? '#0A0E17' : 'text.secondary',
                }}
              >
                30 ngày
              </Button>
              <Button
                onClick={() => setTimeRange('6m')}
                variant={timeRange === '6m' ? 'contained' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  bgcolor: timeRange === '6m' ? theme.palette.primary.main : 'transparent',
                  color: timeRange === '6m' ? '#0A0E17' : 'text.secondary',
                }}
              >
                6 tháng
              </Button>
            </ButtonGroup>

            {/* Metric switch */}
            <Stack direction="row" spacing={0.5} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', p: 0.5, borderRadius: 2 }}>
              <Button
                size="small"
                startIcon={<DollarSign size={15} />}
                onClick={() => setActiveMetric('revenue')}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 1.5,
                  bgcolor: isRevenue ? theme.palette.primary.main : 'transparent',
                  color: isRevenue ? '#0A0E17' : 'text.secondary',
                  '&:hover': { bgcolor: isRevenue ? theme.palette.primary.main : 'action.hover' },
                }}
              >
                Doanh thu
              </Button>
              <Button
                size="small"
                startIcon={<ShoppingCart size={15} />}
                onClick={() => setActiveMetric('orders')}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 1.5,
                  bgcolor: !isRevenue ? '#10B981' : 'transparent',
                  color: !isRevenue ? '#FFFFFF' : 'text.secondary',
                  '&:hover': { bgcolor: !isRevenue ? '#10B981' : 'action.hover' },
                }}
              >
                Đơn hàng
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {/* Responsive SVG Chart */}
        <Box sx={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto', minWidth: 460, overflow: 'visible' }}
            role="img"
            aria-label={`Biểu đồ xu hướng ${isRevenue ? 'doanh thu' : 'đơn hàng'}`}
          >
            <defs>
              <linearGradient id="adminAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = height - padY - ratio * (height - padY * 2);
              return (
                <line
                  key={i}
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area fill */}
            {areaD && <path d={areaD} fill="url(#adminAreaGradient)" />}

            {/* Smooth line */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={3}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${strokeColor}55)`,
                transition: shouldReduceMotion ? 'none' : 'd 300ms ease',
              }}
            />

            {/* Data Points */}
            {points.map((p, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : 4}
                    fill={theme.palette.background.paper}
                    stroke={strokeColor}
                    strokeWidth={2.5}
                    style={{ cursor: 'pointer', transition: 'r 150ms ease' }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {/* Label */}
                  <text
                    x={p.x}
                    y={height - 8}
                    textAnchor="middle"
                    fill={isDark ? '#94A3B8' : '#64748B'}
                    fontSize={11}
                    fontFamily="Space Grotesk, sans-serif"
                    fontWeight={600}
                  >
                    {labels[idx] || `${idx + 1}`}
                  </text>

                  {/* Value tag above point */}
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    fill={isHovered ? strokeColor : (isDark ? '#CBD5E1' : '#475569')}
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={isHovered ? 800 : 600}
                  >
                    {formatVal(p.val)}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdminTrendChart;
