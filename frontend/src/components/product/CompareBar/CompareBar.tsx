/**
 * 🔄 COMPARE BAR - Floating comparison toolbar
 * Fixed at the bottom of the screen, shows selected products for comparison.
 * Appears with slide-up animation when ≥ 2 products are selected.
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../../store';
import { removeFromCompare, clearCompare, selectCompareItems } from '../../../store/slices/compareSlice';
import { buildImageUrl } from '../../../utils/urlHelpers';

const CompareBar: React.FC = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectCompareItems);

  const showBar = items.length >= 2;

  const getThumbUrl = (product: any): string => {
    const primary = product.images?.find((img: any) => img.is_primary || img.isPrimary);
    const path = primary?.file_path || primary?.filePath || product.image_url || product.imageUrl || null;
    return buildImageUrl(path) || '/images/products/placeholder.jpg';
  };

  return (
    <AnimatePresence>
      {showBar && (
        <Box
          component={motion.div}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            py: 1.5,
            px: { xs: 2, md: 4 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            bgcolor: isLight
              ? alpha('#ffffff', 0.95)
              : alpha('#0f172a', 0.95),
            backdropFilter: 'blur(16px)',
            borderTop: `1px solid ${theme.palette.divider}`,
            boxShadow: isLight
              ? '0 -4px 24px rgba(15, 23, 42, 0.08)'
              : '0 -4px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Compare icon + count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareArrowsIcon color="info" />
            <Chip
              label={`${items.length} sản phẩm`}
              size="small"
              color="info"
              variant="outlined"
            />
          </Box>

          {/* Product thumbnails */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, justifyContent: 'center' }}>
            {items.map((product) => (
              <Box
                key={product.id}
                sx={{
                  position: 'relative',
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                  bgcolor: isLight ? '#f8fafc' : '#1e293b',
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={getThumbUrl(product)}
                  alt={product.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }}
                />
                <IconButton
                  size="small"
                  onClick={() => dispatch(removeFromCompare(product.id))}
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    bgcolor: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    '&:hover': { bgcolor: '#ef4444' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Tooltip title="Xóa tất cả">
              <IconButton
                size="small"
                onClick={() => dispatch(clearCompare())}
                sx={{ color: theme.palette.text.secondary }}
              >
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="info"
              startIcon={<CompareArrowsIcon />}
              onClick={() => navigate('/compare')}
              sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
            >
              So sánh ngay
            </Button>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
