/**
 * ❤️ WISHLIST PAGE - Computer Shop E-commerce
 * Displays user's saved/favorite products with remove and add-to-cart actions.
 * Empty state with CTA to explore products.
 */

import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { MotionPage } from '../../components/common/MotionPage';
import { ProductCard } from '../../components/product/ProductCard';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchWishlist, toggleWishlistItem } from '../../store/slices/wishlistSlice';
import { useCart } from '../../hooks/useCart';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useAuth } from '../../hooks/useAuth';
import type { Product } from '../../types/product.types';

const WishlistPage: React.FC = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addItem } = useCart();
  const { showSuccess, showInfo } = useSnackbar();
  const { isAuthenticated } = useAuth();

  const { products, loading } = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemove = (product: Product) => {
    dispatch(toggleWishlistItem({ productId: product.id, isCurrentlyWishlisted: true }));
    showInfo(`Đã bỏ "${product.name}" khỏi yêu thích`);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    showSuccess(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <MotionPage>
        <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
          <FavoriteIcon sx={{ fontSize: 64, color: alpha('#ef4444', 0.3), mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Đăng nhập để xem sản phẩm yêu thích
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Hãy đăng nhập để lưu và quản lý danh sách sản phẩm yêu thích của bạn.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </Container>
      </MotionPage>
    );
  }

  return (
    <MotionPage>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <FavoriteIcon sx={{ color: '#ef4444', fontSize: 28 }} />
            <Typography variant="h4" fontWeight={700}>
              Sản phẩm yêu thích
            </Typography>
          </Box>
          <Typography color="text.secondary">
            {products.length > 0
              ? `${products.length} sản phẩm trong danh sách yêu thích`
              : 'Chưa có sản phẩm nào'}
          </Typography>
        </Box>

        {/* Loading */}
        {loading && (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                <Skeleton variant="rounded" height={380} sx={{ borderRadius: 3.5 }} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              textAlign: 'center',
              py: 10,
              px: 3,
              borderRadius: 4,
              border: `2px dashed ${theme.palette.divider}`,
              bgcolor: isLight ? alpha('#f8fafc', 0.6) : alpha('#1e293b', 0.3),
            }}
          >
            <FavoriteIcon sx={{ fontSize: 80, color: alpha('#ef4444', 0.15), mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Danh sách yêu thích trống
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá các sản phẩm
              và nhấn vào biểu tượng ❤️ để lưu lại.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingBagIcon />}
              onClick={() => navigate('/products')}
              sx={{ borderRadius: 2.5, px: 4 }}
            >
              Khám phá sản phẩm
            </Button>
          </Box>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <ProductCard
                  product={product}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  isWishlisted={true}
                  onToggleWishlist={handleRemove}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </MotionPage>
  );
};

export default WishlistPage;
