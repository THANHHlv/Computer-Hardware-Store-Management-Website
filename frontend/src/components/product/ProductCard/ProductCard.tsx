/**
 * 🛍️ PRODUCT CARD COMPONENT - Computer Shop E-commerce
 * International Clean & Bright Theme + Silky Ultra-Smooth Micro-interactions
 * Optimized for high conversion, Apple/NZXT-grade aesthetic, and 60fps fluidity
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
  useTheme,
  alpha,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import { motion, useReducedMotion } from 'framer-motion';

// Types
import type { Product } from '../../../types/product.types';
import { buildImageUrl } from '../../../utils/urlHelpers';
import type { ProductCardProps } from './ProductCard.types';

export interface ExtendedProductCardProps extends ProductCardProps {
  onAddToCart?: (product: Product) => void;
}

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
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
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
      whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.015 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
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
        borderRadius: 3.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: isLight
          ? '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 6px 16px -4px rgba(15, 23, 42, 0.06)'
          : '0 8px 24px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 220ms ease, box-shadow 220ms ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.4),
          boxShadow: isLight
            ? `0 18px 36px -4px rgba(15, 23, 42, 0.1), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.25)}`
            : `0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
          '& .product-card-img': {
            transform: shouldReduceMotion ? 'none' : 'scale(1.05)',
          },
          '& .quick-action-button': {
            opacity: 1,
            transform: 'scale(1)',
          },
        },
        opacity: product.is_active ? 1 : 0.65,
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
          bgcolor: isLight ? '#F8FAFC' : '#0B0F19',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.5,
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
            objectFit: 'contain',
            transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Stock status badge */}
        <Chip
          label={stockInfo.text}
          color={stockInfo.color as any}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontSize: '0.68rem',
            fontWeight: 700,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        />

        {/* Quick View Button */}
        {onQuickView && (
          <IconButton
            className="quick-action-button"
            onClick={handleQuickView}
            aria-label={`Xem nhanh ${product.name}`}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              opacity: 0,
              transform: 'scale(0.85)',
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(17, 24, 39, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.primary,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: '#FFFFFF',
                borderColor: theme.palette.primary.main,
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
          px: { xs: 2, md: 2.2 },
          pt: 1.8,
          pb: 2.2,
        }}
      >
        <Box>
          {/* Category */}
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: 700,
              color: 'primary.main',
              display: 'block',
              mb: 0.5,
              fontSize: '0.72rem',
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
              fontSize: '0.92rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: 'text.primary',
              minHeight: { xs: 36, md: 40 },
            }}
          >
            {product.name}
          </Typography>

          {/* Key Specifications / Brand */}
          {product.specifications?.brand && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.5,
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            >
              Hãng: {product.specifications.brand}
            </Typography>
          )}
        </Box>

        {/* Price & Add to Cart Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            pt: 1.2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h6"
            className="tabular-nums font-mono-numbers"
            sx={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: theme.palette.primary.main,
              letterSpacing: '-0.02em',
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
                  bgcolor: addedBounce 
                    ? theme.palette.secondary.main 
                    : alpha(theme.palette.primary.main, 0.08),
                  color: addedBounce 
                    ? '#FFFFFF' 
                    : theme.palette.primary.main,
                  border: `1px solid ${addedBounce ? theme.palette.secondary.main : alpha(theme.palette.primary.main, 0.25)}`,
                  borderRadius: 2,
                  p: 0.8,
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    bgcolor: theme.palette.primary.main,
                    color: '#FFFFFF',
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
                    transform: 'scale(1.06)',
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
