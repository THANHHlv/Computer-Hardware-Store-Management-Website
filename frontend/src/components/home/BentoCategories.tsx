import React from 'react';
import { Box, Typography, Container, Stack, Chip } from '@mui/material';
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
    accentColor: '#00F0FF',
    icon: Zap,
    gridSpan: { xs: '12', md: '7' },
    categoryQuery: '2',
  },
  {
    id: 2,
    title: 'Bộ Vi Xử Lý CPU',
    subtitle: 'Intel Core Ultra & AMD Ryzen 9000. Xung nhịp vượt trội cho gaming và render 3D.',
    tag: 'HIỆU NĂNG CAO',
    accentColor: '#FF4655',
    icon: Cpu,
    gridSpan: { xs: '12', md: '5' },
    categoryQuery: '1',
  },
  {
    id: 3,
    title: 'RAM DDR5 Gaming',
    subtitle: 'Băng thông siêu tốc lên đến 8400MHz, RGB Sync đa sắc.',
    tag: '8400MHz',
    accentColor: '#38BDF8',
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
    subtitle: 'Tốc độ đọc ghi đến 14.000 MB/s. Load game và dữ liệu trong chớp mắt.',
    tag: '14.000 MB/s',
    accentColor: '#10B981',
    icon: HardDrive,
    gridSpan: { xs: '12', md: '4' },
    categoryQuery: '5',
  },
  {
    id: 6,
    title: 'Tản Nhiệt Nước & Khí',
    subtitle: 'AIO 360mm màn hình LCD tùy biến, giữ dàn máy luôn mát mẻ.',
    tag: 'ARGB Cooling',
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
    accentColor: '#A855F7',
    icon: BoxIcon,
    gridSpan: { xs: '12', md: '6' },
    categoryQuery: '7',
  },
];

export const BentoCategories: React.FC = () => {
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
            <Sparkles size={18} color="#00F0FF" />
            <Typography variant="overline" sx={{ color: '#00F0FF', fontWeight: 700, letterSpacing: 1.5 }}>
              DANH MỤC LINH KIỆN CAO CẤP
            </Typography>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
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
              whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleCardClick(item.categoryQuery)}
              sx={{
                gridColumn: {
                  xs: 'span 1',
                  md: `span ${item.gridSpan.md}`,
                },
                position: 'relative',
                borderRadius: 3,
                p: { xs: 3, md: 3.5 },
                cursor: 'pointer',
                bgcolor: '#131B2E',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: `linear-gradient(135deg, rgba(19, 27, 46, 0.95) 0%, rgba(10, 14, 23, 0.98) 100%)`,
                overflow: 'hidden',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
                '&:hover': {
                  borderColor: item.accentColor,
                  boxShadow: `0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${item.accentColor}33`,
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
                  background: `radial-gradient(circle, ${item.accentColor}22 0%, transparent 70%)`,
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
                        bgcolor: `${item.accentColor}18`,
                        border: `1px solid ${item.accentColor}44`,
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
                          bgcolor: 'rgba(255, 255, 255, 0.06)',
                          color: item.accentColor,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          border: `1px solid ${item.accentColor}33`,
                        }}
                      />
                      <Box
                        className="arrow-icon"
                        sx={{
                          color: '#94A3B8',
                          transition: 'transform 200ms ease, color 200ms ease',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <ArrowUpRight size={20} />
                      </Box>
                    </Stack>
                  </Stack>

                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#F8FAFC', mb: 1 }}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                    {item.subtitle}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: item.accentColor,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    pt: 1,
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

export default BentoCategories;
