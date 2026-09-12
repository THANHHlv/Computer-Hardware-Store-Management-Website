/**
 * 🛍️ PRODUCT CARD COMPONENT - Computer Shop E-commerce
 * Dark Gaming Theme & Micro-interactions
 * Tuân thủ ui-ux-pro-max design system MASTER.md
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import { motion, useReducedMotion } from 'framer-motion';

// Types - chỉ sử dụng backend Product
import type { Product } from '../../../types/product.types';
import { buildImageUrl } from '../../../utils/urlHelpers';
import type { ProductCardProps } from './ProductCard.types';

// Extended props to support onAddToCart
export interface ExtendedProductCardProps extends ProductCardProps {
  onAddToCart?: (product: Product) => void;
}

// ===== HELPER FUNCTIONS =====
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const getImageUrl = (product: Product): string => {
  const placeholder = '/images/products/placeholder.jpg';
  const primary = product.images?.find((image) => (image as any).is_primary || (image as any).isPrimary);
  const path =
    primary?.file_path ||
    (primary as any)?.filePath ||
    product.image_url ||
    (product as any)?.imageUrl ||
    null;
  const built = buildImageUrl(path);
  return built || placeholder;
};

const getStockStatus = (product: Product) => {
  const quantity = product.quantity ?? 0;
  if (quantity <= 0 || product.is_active === false) {
    return { status: 'out_of_stock', color: 'error', text: 'Hết hàng' };
  }
  return { status: 'in_stock', color: 'success', text: 'Còn hàng' };
};

const CARD_HEIGHT = {
  xs: 340,
  sm: 360,
  md: 380,
  lg: 420,
} as const;

const DEFAULT_CARD_WIDTH = '100%';

const buildFixedWidthStyles = (width?: number) => {
  if (typeof width !== 'number' || Number.isNaN(width) || width <= 0) {
    return DEFAULT_CARD_WIDTH;
  }
  return {
    xs: '100%',
    sm: `${width}px`,
    md: `${width}px`,
    lg: `${width}px`,
    xl: `${width}px`,
  } as const;
};

const resolveHeightValue = (heightSetting: typeof CARD_HEIGHT | number, breakpoint: keyof typeof CARD_HEIGHT) => {
  if (typeof heightSetting === 'number') {
    return heightSetting;
  }
  return heightSetting[breakpoint] ?? CARD_HEIGHT[breakpoint];
};

export const ProductCard: React.FC<ExtendedProductCardProps> = ({
  product,
  onQuickView,
  onProductClick,
  onAddToCart,
  className,
  sx,
  imageAspectRatio = '1/1',
  dimensions,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [addedBounce, setAddedBounce] = useState(false);
  const imageUrl = getImageUrl(product);
  const stockInfo = getStockStatus(product);

  const cardWidthStyles = buildFixedWidthStyles(dimensions?.width);
  const hasFixedWidth = Boolean(dimensions?.width);
  const hasFixedHeight = Boolean(dimensions?.height);
  const cardHeightValue = dimensions?.height ?? CARD_HEIGHT;

  const imageHeights = {
    xs: `${Math.round(resolveHeightValue(cardHeightValue, 'xs') * 0.48)}px`,
    sm: `${Math.round(resolveHeightValue(cardHeightValue, 'sm') * 0.48)}px`,
    md: `${Math.round(resolveHeightValue(cardHeightValue, 'md') * 0.50)}px`,
    lg: `${Math.round(resolveHeightValue(cardHeightValue, 'lg') * 0.52)}px`,
  };

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAddedBounce(true);
      setTimeout(() => setAddedBounce(false), 800);
    }
  };

  return (
    <Card
      component={shouldReduceMotion ? 'div' : motion.div}
      whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.02 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={className}
      onClick={handleProductClick}
      sx={{
        width: cardWidthStyles,
        ...(hasFixedWidth && {
          maxWidth: cardWidthStyles,
          minWidth: cardWidthStyles,
        }),
        height: cardHeightValue,
        ...(hasFixedHeight && {
          minHeight: cardHeightValue,
          maxHeight: cardHeightValue,
        }),
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        cursor: onProductClick ? 'pointer' : 'default',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#131B2E',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 220ms ease, box-shadow 220ms ease',
        '&:hover': {
          borderColor: 'rgba(0, 240, 255, 0.3)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 240, 255, 0.15)',
          '& .product-card-img': {
            transform: shouldReduceMotion ? 'none' : 'scale(1.06)',
          },
          '& .quick-action-bar': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        opacity: product.is_active ? 1 : 0.6,
        ...sx,
      }}
    >
      {/* Product Image Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: imageHeights,
          minHeight: imageHeights,
          maxHeight: imageHeights,
          aspectRatio: imageAspectRatio,
          overflow: 'hidden',
          bgcolor: '#0F172A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="img"
          className="product-card-img"
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 300ms ease',
          }}
        />

        {/* Stock status badge */}
        <Chip
          label={stockInfo.text}
          color={stockInfo.color as any}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: '0.7rem',
            fontWeight: 700,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        />

        {/* Quick View Button */}
        {onQuickView && (
          <IconButton
            onClick={handleQuickView}
            aria-label={`Xem nhanh ${product.name}`}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(10, 14, 23, 0.75)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F8FAFC',
              '&:hover': {
                backgroundColor: '#00F0FF',
                color: '#0A0E17',
              },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Product Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: { xs: 2, md: 2.5 },
          pt: 2,
          pb: 2.5,
        }}
      >
        <Box>
          {/* Category */}
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontWeight: 700,
              color: '#00F0FF',
              display: 'block',
              mb: 0.5,
            }}
          >
            {product.category?.name || 'LINH KIỆN'}
          </Typography>

          {/* Product Name */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: '#F8FAFC',
              minHeight: { xs: 38, md: 42 },
            }}
          >
            {product.name}
          </Typography>

          {/* Key Specifications */}
          {product.specifications?.brand && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.5,
                fontWeight: 500,
              }}
            >
              Hãng: {product.specifications.brand}
            </Typography>
          )}
        </Box>

        {/* Price & Add to Cart Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography
            variant="h6"
            className="tabular-nums font-mono-numbers"
            sx={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: '#00F0FF',
            }}
          >
            {formatPrice(product.price)}
          </Typography>

          {onAddToCart && (
            <Tooltip title={addedBounce ? "Đã thêm vào giỏ!" : "Thêm vào giỏ hàng"}>
              <IconButton
                component={motion.button as any}
                animate={addedBounce ? { scale: [1, 1.25, 0.95, 1], rotate: [0, -10, 10, 0] } : {}}
                onClick={handleAddToCartClick}
                size="small"
                aria-label={`Thêm ${product.name} vào giỏ`}
                sx={{
                  bgcolor: addedBounce ? '#10B981' : 'rgba(0, 240, 255, 0.12)',
                  color: addedBounce ? '#0A0E17' : '#00F0FF',
                  border: `1px solid ${addedBounce ? '#10B981' : 'rgba(0, 240, 255, 0.3)'}`,
                  '&:hover': {
                    bgcolor: '#00F0FF',
                    color: '#0A0E17',
                    boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
                  },
                }}
              >
                {addedBounce ? <CheckIcon fontSize="small" /> : <ShoppingCartIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(ProductCard);
