import React from 'react';
import { Box, Typography, Container, Stack, Chip, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Cpu, Zap, HardDrive, Fan, Layers, Box as BoxIcon, ArrowUpRight, Sparkles } from 'lucide-react';

interface BentoItem {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  accentColor: string;
  icon: React.ElementType;
  gridSpan: {
    xs: string;
    md: string;
  };
  categoryQuery: string;
}

const BENTO_ITEMS: BentoItem[] = [
  {
    id: 1,
    title: 'Card Đồ Họa VGA',
    subtitle: 'NVIDIA RTX 50 Series & Radeon RX 8000. Đồ họa ray tracing 4K siêu thực & tăng tốc AI.',
    tag: 'SIÊU HOT',
    accentColor: '#2563EB',
    icon: Zap,
    gridSpan: { xs: '12', md: '7' },
    categoryQuery: '2',
  },
  {
    id: 2,
    title: 'Bộ Vi Xử Lý CPU',
    subtitle: 'Intel Core Ultra & AMD Ryzen 9000. Xung nhịp vượt trội cho gaming và render 3D.',
    tag: 'HIỆU NĂNG CAO',
    accentColor: '#EF4444',
    icon: Cpu,
    gridSpan: { xs: '12', md: '5' },
    categoryQuery: '1',
  },
  {
    id: 3,
    title: 'RAM DDR5 Gaming',
    subtitle: 'Băng thông siêu tốc lên đến 8400MHz, RGB Sync đa sắc.',
    tag: '8400MHz',
    accentColor: '#0EA5E9',
    icon: Layers,
    gridSpan: { xs: '12', md: '4' },
    categoryQuery: '3',
  },
  {
    id: 4,
    title: 'Bo Mạch Chủ',
    subtitle: 'Z890 & X870E thế hệ mới. VRM mạnh mẽ, hỗ trợ PCIe Gen 5.',
    tag: 'PCIe 5.0',
    accentColor: '#F59E0B',
    icon: Layers,
    gridSpan: { xs: '12', md: '4' },
    categoryQuery: '4',
  },
  {
    id: 5,
    title: 'Ổ Cứng SSD NVMe',
    subtitle: 'Gen 5 tốc độ đọc 14.000 MB/s, load game tức thì.',
    tag: 'TỐC ĐỘ CAO',
    accentColor: '#10B981',
    icon: HardDrive,
    gridSpan: { xs: '12', md: '4' },
    categoryQuery: '5',
  },
  {
    id: 6,
    title: 'Tản Nhiệt Nước AIO',
    subtitle: 'Màn hình LCD hiển thị nhiệt độ thực tế, pump êm ái, rad 360mm tản nhiệt tối ưu.',
    tag: 'LCD DISPLAY',
    accentColor: '#06B6D4',
    icon: Fan,
    gridSpan: { xs: '12', md: '6' },
    categoryQuery: '6',
  },
  {
    id: 7,
    title: 'Vỏ Case & Nguồn PSU',
    subtitle: 'Case Panoramic mặt kính vô cực & Nguồn ATX 3.1 PCIe 5.0 cấp nguồn ổn định tối đa.',
    tag: 'ATX 3.1 & Kính Vô Cực',
    accentColor: '#8B5CF6',
    icon: BoxIcon,
    gridSpan: { xs: '12', md: '6' },
    categoryQuery: '7',
  },
];

export const BentoCategories: React.FC = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const handleCardClick = (catId: string) => {
    navigate(`/products?categoryId=${catId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 12 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Sparkles size={18} color={theme.palette.primary.main} />
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 1.5,
              }}
            >
              DANH MỤC LINH KIỆN CAO CẤP
            </Typography>
          </Stack>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            Hệ Sinh Thái Phần Cứng Gaming
          </Typography>
        </Box>
      </Stack>

      {/* Bento Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
          gap: 2.5,
        }}
      >
        {BENTO_ITEMS.map((item) => {
          const IconComp = item.icon as any;
          return (
            <Box
              key={`bento-${item.id}`}
              component={shouldReduceMotion ? 'div' : motion.div}
              whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.012 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleCardClick(item.categoryQuery)}
              sx={{
                gridColumn: {
                  xs: 'span 1',
                  md: `span ${item.gridSpan.md}`,
                },
                position: 'relative',
                borderRadius: 3.5,
                p: { xs: 3, md: 3.5 },
                cursor: 'pointer',
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: isLight
                  ? '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 6px 18px -4px rgba(15, 23, 42, 0.06)'
                  : '0 8px 24px rgba(0, 0, 0, 0.4)',
                background: isLight
                  ? `linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)`
                  : `linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)`,
                overflow: 'hidden',
                transition: 'border-color 220ms ease, box-shadow 220ms ease',
                '&:hover': {
                  borderColor: alpha(item.accentColor, 0.45),
                  boxShadow: isLight
                    ? `0 16px 36px -4px rgba(15, 23, 42, 0.1), 0 0 0 1px ${alpha(item.accentColor, 0.2)}`
                    : `0 14px 34px rgba(0, 0, 0, 0.5), 0 0 20px ${item.accentColor}33`,
                  '& .arrow-icon': {
                    transform: 'translate(3px, -3px)',
                    color: item.accentColor,
                  },
                },
              }}
            >
              {/* Background ambient gradient spot */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${item.accentColor}18 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              <Stack spacing={2} sx={{ height: '100%', justifyContent: 'space-between' }}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${item.accentColor}14`,
                        border: `1px solid ${item.accentColor}33`,
                        color: item.accentColor,
                      }}
                    >
                      <IconComp size={24} />
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={item.tag}
                        size="small"
                        sx={{
                          bgcolor: alpha(item.accentColor, 0.08),
                          color: item.accentColor,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          border: `1px solid ${alpha(item.accentColor, 0.25)}`,
                        }}
                      />
                      <Box
                        className="arrow-icon"
                        sx={{
                          color: 'text.secondary',
                          transition: 'transform 200ms ease, color 200ms ease',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <ArrowUpRight size={20} />
                      </Box>
                    </Stack>
                  </Stack>

                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, fontSize: '1.2rem' }}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item.subtitle}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: item.accentColor,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    pt: 1,
                    fontSize: '0.78rem',
                  }}
                >
                  KHÁM PHÁ NGAY →
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};
