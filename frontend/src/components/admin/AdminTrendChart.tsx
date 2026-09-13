import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, Button, useTheme } from '@mui/material';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

export interface AdminTrendChartProps {
  monthlyRevenueTrend?: number[];
  monthlyOrdersTrend?: number[];
  months?: string[];
}

export const AdminTrendChart: React.FC<AdminTrendChartProps> = ({
  monthlyRevenueTrend = [45000000, 68000000, 82000000, 75000000, 95000000, 120000000],
  monthlyOrdersTrend = [35, 52, 64, 58, 76, 94],
  months = ['T4', 'T5', 'T6', 'T7', 'T8', 'T9'],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const shouldReduceMotion = useReducedMotion();
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = activeMetric === 'revenue' ? monthlyRevenueTrend : monthlyOrdersTrend;
  const isRevenue = activeMetric === 'revenue';
  const strokeColor = isRevenue ? theme.palette.primary.main : '#10B981';

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  // Chart dimensions
  const width = 600;
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

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

  const formatVal = (v: number) => {
    if (isRevenue) {
      return (v / 1000000).toFixed(1) + ' tr ₫';
    }
    return v.toLocaleString('vi-VN') + ' đơn';
  };

  return (
    <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <TrendingUp size={18} color={strokeColor} />
              <Typography variant="overline" sx={{ color: strokeColor, fontWeight: 700, letterSpacing: 1 }}>
                XU HƯỚNG TĂNG TRƯỞNG
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {isRevenue ? 'Biểu Đồ Doanh Thu 6 Tháng' : 'Biểu Đồ Sản Lượng Đơn Hàng'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', p: 0.5, borderRadius: 2 }}>
            <Button
              size="small"
              startIcon={<DollarSign size={16} />}
              onClick={() => setActiveMetric('revenue')}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 1.5,
                bgcolor: isRevenue ? theme.palette.primary.main : 'transparent',
                color: isRevenue ? '#FFFFFF' : 'text.secondary',
                '&:hover': { bgcolor: isRevenue ? theme.palette.primary.main : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') },
              }}
            >
              Doanh thu
            </Button>
            <Button
              size="small"
              startIcon={<ShoppingCart size={16} />}
              onClick={() => setActiveMetric('orders')}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 1.5,
                bgcolor: !isRevenue ? '#10B981' : 'transparent',
                color: !isRevenue ? '#FFFFFF' : 'text.secondary',
                '&:hover': { bgcolor: !isRevenue ? '#10B981' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') },
              }}
            >
              Đơn hàng
            </Button>
          </Stack>
        </Stack>

        {/* Responsive SVG Chart */}
        <Box sx={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto', minWidth: 420, overflow: 'visible' }}
            role="img"
            aria-label={`Biểu đồ xu hướng ${isRevenue ? 'doanh thu' : 'đơn hàng'}`}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
                  stroke={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area fill */}
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Smooth line */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={3}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${strokeColor}44)`,
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
                  {/* Month Label */}
                  <text
                    x={p.x}
                    y={height - 8}
                    textAnchor="middle"
                    fill={isDark ? "#94A3B8" : "#64748B"}
                    fontSize={12}
                    fontFamily="Space Grotesk, sans-serif"
                    fontWeight={600}
                  >
                    {months[idx] || `T${idx + 1}`}
                  </text>

                  {/* Value tag above point */}
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    fill={isHovered ? strokeColor : (isDark ? '#CBD5E1' : '#475569')}
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={isHovered ? 700 : 500}
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
