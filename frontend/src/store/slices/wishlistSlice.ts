/**
 * ❤️ WISHLIST SLICE - Computer Shop E-commerce
 *
 * Redux slice for wishlist state management
 * Tracks wishlisted product IDs and full product data
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { wishlistService } from '../../services/wishlist.service';
import type { Product } from '../../types/product.types';

interface WishlistState {
  /** Set of product IDs currently in wishlist */
  itemIds: number[];
  /** Full product data for wishlist page */
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  itemIds: [],
  products: [],
  loading: false,
  error: null,
};

// ===== ASYNC THUNKS =====

/** Fetch full wishlist (products + IDs) */
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const products = await wishlistService.getWishlist();
      return products;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Không thể tải danh sách yêu thích');
    }
  }
);

/** Toggle (add/remove) a product in wishlist */
export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleItem',
  async (
    { productId, isCurrentlyWishlisted }: { productId: number; isCurrentlyWishlisted: boolean },
    { rejectWithValue }
  ) => {
    try {
      if (isCurrentlyWishlisted) {
        await wishlistService.removeFromWishlist(productId);
      } else {
        await wishlistService.addToWishlist(productId);
      }
      return { productId, added: !isCurrentlyWishlisted };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Không thể cập nhật danh sách yêu thích');
    }
  }
);

/** Batch check which product IDs are in wishlist */
export const checkWishlistBatch = createAsyncThunk(
  'wishlist/checkBatch',
  async (productIds: number[], { rejectWithValue }) => {
    try {
      const wishlistedIds = await wishlistService.checkWishlistStatus(productIds);
      return wishlistedIds;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Không thể kiểm tra trạng thái yêu thích');
    }
  }
);

// ===== SLICE =====

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.itemIds = [];
      state.products = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchWishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
        state.itemIds = action.payload.map((p) => p.id);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // toggleWishlistItem
    builder
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const { productId, added } = action.payload;
        if (added) {
          if (!state.itemIds.includes(productId)) {
            state.itemIds.push(productId);
          }
        } else {
          state.itemIds = state.itemIds.filter((id) => id !== productId);
          state.products = state.products.filter((p) => p.id !== productId);
        }
      });

    // checkWishlistBatch
    builder
      .addCase(checkWishlistBatch.fulfilled, (state, action: PayloadAction<number[]>) => {
        // Merge new IDs with existing ones (don't remove existing)
        const newIds = action.payload;
        const merged = new Set([...state.itemIds, ...newIds]);
        state.itemIds = Array.from(merged);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
