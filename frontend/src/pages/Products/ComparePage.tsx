/**
 * 🔄 COMPARE PAGE - Product side-by-side comparison
 * Dynamically reads attributes from JSONB per category.
 * Highlights differences between products.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

import { MotionPage } from '../../components/common/MotionPage';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  removeFromCompare,
  clearCompare,
  selectCompareItems,
  selectCompareCategoryName,
} from '../../store/slices/compareSlice';
import { buildImageUrl } from '../../utils/urlHelpers';
import { useCart } from '../../hooks/useCart';
import { useSnackbar } from '../../hooks/useSnackbar';
import { categoryService } from '../../services/category.service';
import type { AttributeDefinition } from '../../types/product.types';
import type { Product } from '../../types/product.types';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const ComparePage: React.FC = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addItem } = useCart();
  const { showSuccess } = useSnackbar();
  const items = useAppSelector(selectCompareItems);
  const categoryName = useAppSelector(selectCompareCategoryName);
  const [attrDefs, setAttrDefs] = useState<AttributeDefinition[]>([]);

  // Fetch attribute definitions for the category
  useEffect(() => {
    const categoryId = items[0]?.category?.id;
    if (categoryId) {
      categoryService
        .getCategoryFilters(categoryId)
        .then((defs: AttributeDefinition[]) => setAttrDefs(defs))
        .catch(() => setAttrDefs([]));
    }
  }, [items]);

  // Build comparison rows from attribute definitions + basic fields
  const comparisonRows = useMemo(() => {
    const basicRows = [
      { label: 'Giá', key: '__price__', getValue: (p: Product) => formatPrice(p.price) },
      { label: 'Tình trạng', key: '__stock__', getValue: (p: Product) => (p.quantity > 0 ? 'Còn hàng' : 'Hết hàng') },
    ];

    const attrRows = attrDefs
      .filter((d) => d.is_active !== false)
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
      .map((def) => ({
        label: def.display_name,
        key: def.code,
        getValue: (p: Product) => {
          const val = p.attributes?.[def.code];
          if (val === undefined || val === null) return '—';
          if (typeof val === 'boolean') return val ? 'Có' : 'Không';
          return `${val}${def.unit ? ` ${def.unit}` : ''}`;
        },
      }));

    // Also extract specs keys not in attrDefs
    const specKeys = new Set<string>();
    items.forEach((p) => {
      if (p.specifications) {
        Object.keys(p.specifications).forEach((k) => specKeys.add(k));
      }
    });
    const attrCodes = new Set(attrDefs.map((d) => d.code));
    const specRows = Array.from(specKeys)
      .filter((k) => !attrCodes.has(k))
      .map((k) => ({
        label: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' '),
        key: `spec_${k}`,
        getValue: (p: Product) => {
          const val = p.specifications?.[k];
          if (val === undefined || val === null) return '—';
          return String(val);
        },
      }));

    return [...basicRows, ...attrRows, ...specRows];
  }, [attrDefs, items]);

  const getThumbUrl = (product: Product): string => {
    const primary = product.images?.find((img: any) => img.is_primary || img.isPrimary);
    const path = primary?.file_path || (primary as any)?.filePath || product.image_url || null;
    return buildImageUrl(path) || '/images/products/placeholder.jpg';
  };

  const isDifferent = (row: { getValue: (p: Product) => string }) => {
    if (items.length < 2) return false;
    const vals = items.map((p) => row.getValue(p));
    return !vals.every((v) => v === vals[0]);
  };

  if (items.length < 2) {
    return (
      <MotionPage>
        <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
          <CompareArrowsIcon sx={{ fontSize: 64, color: alpha(theme.palette.info.main, 0.3), mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Chưa đủ sản phẩm để so sánh
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Hãy chọn ít nhất 2 sản phẩm cùng danh mục để so sánh.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')}>
            Xem sản phẩm
          </Button>
        </Container>
      </MotionPage>
    );
  }

  return (
    <MotionPage>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2, color: 'text.secondary' }}
          >
            Quay lại
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CompareArrowsIcon color="info" sx={{ fontSize: 28 }} />
            <Typography variant="h4" fontWeight={700}>
              So sánh sản phẩm
            </Typography>
          </Box>
          {categoryName && (
            <Chip label={categoryName} color="info" variant="outlined" size="small" />
          )}
        </Box>

        {/* Comparison Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'auto',
          }}
        >
          <Table sx={{ minWidth: items.length * 250 + 200 }}>
            {/* Product headers */}
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    minWidth: 180,
                    fontWeight: 700,
                    bgcolor: isLight ? '#f8fafc' : '#0f172a',
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                  }}
                >
                  Thông số
                </TableCell>
                {items.map((product) => (
                  <TableCell
                    key={product.id}
                    align="center"
                    sx={{
                      minWidth: 220,
                      bgcolor: isLight ? '#f8fafc' : '#0f172a',
                      borderLeft: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Box
                        component="img"
                        src={getThumbUrl(product)}
                        alt={product.name}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'contain',
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          p: 0.5,
                          bgcolor: theme.palette.background.paper,
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/product/${product.id}`)}
                      />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          textAlign: 'center',
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => {
                            addItem(product, 1);
                            showSuccess(`Đã thêm "${product.name}" vào giỏ`);
                          }}
                          sx={{ borderRadius: 2, fontSize: '0.7rem', textTransform: 'none' }}
                        >
                          Thêm giỏ
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => dispatch(removeFromCompare(product.id))}
                          sx={{ color: 'text.secondary' }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* Comparison rows */}
            <TableBody>
              {comparisonRows.map((row, idx) => {
                const diff = isDifferent(row);
                return (
                  <TableRow
                    key={row.key}
                    sx={{
                      bgcolor: diff
                        ? alpha(theme.palette.warning.light, isLight ? 0.08 : 0.04)
                        : idx % 2 === 0
                        ? 'transparent'
                        : alpha(theme.palette.action.hover, 0.03),
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        position: 'sticky',
                        left: 0,
                        bgcolor: diff
                          ? alpha(theme.palette.warning.light, isLight ? 0.12 : 0.08)
                          : isLight
                          ? '#fff'
                          : '#0f172a',
                        zIndex: 1,
                        borderRight: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {row.label}
                      {diff && (
                        <Chip
                          label="Khác"
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                    </TableCell>
                    {items.map((product) => (
                      <TableCell
                        key={product.id}
                        align="center"
                        sx={{
                          fontSize: '0.85rem',
                          borderLeft: `1px solid ${theme.palette.divider}`,
                          fontWeight: diff ? 600 : 400,
                        }}
                      >
                        {row.getValue(product)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Clear all */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => {
              dispatch(clearCompare());
              navigate('/products');
            }}
            sx={{ borderRadius: 2 }}
          >
            Xóa tất cả & quay lại
          </Button>
        </Box>
      </Container>
    </MotionPage>
  );
};

export default ComparePage;
