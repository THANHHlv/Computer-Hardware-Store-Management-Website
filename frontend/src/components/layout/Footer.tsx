import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CopyrightIcon from '@mui/icons-material/Copyright';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <Box
        component="footer"
        sx={{
          bgcolor: isLight ? '#F1F5F9' : '#0B0F19',
          py: 3,
          mt: 'auto',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {currentYear} PC Shop. Bảo lưu mọi quyền.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="/privacy" color="text.secondary" variant="body2" underline="hover">
                Chính sách bảo mật
              </Link>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Link href="/terms" color="text.secondary" variant="body2" underline="hover">
                Điều khoản sử dụng
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: isLight ? '#F8FAFC' : '#0B0F19',
        color: theme.palette.text.primary,
        py: { xs: 6, md: 8 },
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`,
        transition: 'background-color 250ms ease, color 250ms ease',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: '1.2fr 1fr 1fr 1.2fr',
            },
            gap: { xs: 4, md: 5 },
          }}
        >
          {/* Company Info */}
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.01em',
                background: isLight
                  ? 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)'
                  : 'linear-gradient(135deg, #FFFFFF 0%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                mb: 1.5,
              }}
            >
              PC Shop
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              Hệ thống bán lẻ linh kiện máy tính và giải pháp công nghệ cao cấp chính hãng. 
              Tư vấn cấu hình tối ưu gaming, đồ họa, AI & máy trạm chuyên nghiệp.
            </Typography>
            
            {/* Social Media */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: FacebookIcon, hoverColor: '#1877F2', label: 'Facebook' },
                { icon: YouTubeIcon, hoverColor: '#FF0000', label: 'YouTube' },
                { icon: InstagramIcon, hoverColor: '#E4405F', label: 'Instagram' },
                { icon: TwitterIcon, hoverColor: '#1DA1F2', label: 'Twitter' },
              ].map(({ icon: IconComp, hoverColor, label }) => (
                <IconButton
                  key={label}
                  size="small"
                  aria-label={label}
                  sx={{
                    color: 'text.secondary',
                    bgcolor: isLight ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 1,
                    transition: 'all 200ms ease',
                    '&:hover': {
                      color: hoverColor,
                      bgcolor: alpha(hoverColor, 0.1),
                      borderColor: alpha(hoverColor, 0.3),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <IconComp fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Product Categories */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Danh mục linh kiện
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {[
                { label: 'CPU - Bộ vi xử lý', href: '/products?category=1' },
                { label: 'VGA - Card màn hình', href: '/products?category=2' },
                { label: 'RAM - Bộ nhớ trong', href: '/products?category=3' },
                { label: 'Mainboard - Bo mạch chủ', href: '/products?category=4' },
                { label: 'SSD/HDD - Ổ cứng lưu trữ', href: '/products?category=5' },
                { label: 'PSU - Nguồn máy tính', href: '/products?category=6' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  variant="body2"
                  underline="none"
                  sx={{
                    color: 'text.secondary',
                    transition: 'color 180ms ease, transform 180ms ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(3px)',
                    },
                  }}
                >
                  {label}
                </Link>
              ))}
            </Box>
          </Box>

          {/* Customer Service */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Hỗ trợ khách hàng
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {[
                { label: 'Trung tâm hỗ trợ', href: '/support' },
                { label: 'Chính sách bảo hành', href: '/warranty' },
                { label: 'Chính sách đổi trả', href: '/return-policy' },
                { label: 'Chính sách vận chuyển', href: '/shipping' },
                { label: 'Hướng dẫn thanh toán', href: '/payment' },
                { label: 'Hướng dẫn Build PC', href: '/build-pc-guide' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  variant="body2"
                  underline="none"
                  sx={{
                    color: 'text.secondary',
                    transition: 'color 180ms ease, transform 180ms ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(3px)',
                    },
                  }}
                >
                  {label}
                </Link>
              ))}
            </Box>
          </Box>

          {/* Contact Info */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Thông tin liên hệ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <LocationOnIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">
                  96A Đ. Trần Phú, P. Mộ Lao, Hà Đông, Hà Nội
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <PhoneIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Hotline: <strong>1900-1234</strong> (Miễn phí)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <EmailIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  support@computershop.com
                </Typography>
              </Box>
              
              {/* Working Hours */}
              <Box
                sx={{
                  mt: 0.5,
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: isLight ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  Thời gian phục vụ:
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  T2 - T6: 8:00 - 20:00 • T7 - CN: 9:00 - 18:00
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <CopyrightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {currentYear} Computer Shop. Chuẩn thương mại điện tử quốc tế.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="/privacy" color="text.secondary" variant="body2" underline="hover">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" color="text.secondary" variant="body2" underline="hover">
              Điều khoản dịch vụ
            </Link>
            <Link href="/cookies" color="text.secondary" variant="body2" underline="hover">
              Cookie & Bảo mật
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
