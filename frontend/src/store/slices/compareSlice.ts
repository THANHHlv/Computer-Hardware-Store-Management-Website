/**
 * 🔄 COMPARE SLICE - Computer Shop E-commerce
 *
 * Redux slice for product comparison state management.
 * Persists to localStorage so selections survive page refresh.
 * Frontend-only feature — no server sync needed.
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types/product.types';

const STORAGE_KEY = 'pc_shop_compare';
const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  /** Products currently selected for comparison */
  items: Product[];
  /** Category ID constraint — all items must share the same category */
  categoryId: number | null;
  /** Category name for display */
  categoryName: string | null;
}

// Load from localStorage on init
const loadFromStorage = (): CompareState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CompareState;
      if (Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { items: [], categoryId: null, categoryName: null };
};

const saveToStorage = (state: CompareState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

const initialState: CompareState = loadFromStorage();

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    /**
     * Add a product to compare list.
     * Returns an error string via meta if validation fails.
     */
    addToCompare: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const productCategoryId = product.category?.id;

      // Already in list?
      if (state.items.some((p) => p.id === product.id)) {
        return;
      }

      // Max items reached?
      if (state.items.length >= MAX_COMPARE_ITEMS) {
        return;
      }

      // Category mismatch?
      if (state.categoryId !== null && productCategoryId !== state.categoryId) {
        return;
      }

      // First item — set category constraint
      if (state.items.length === 0) {
        state.categoryId = productCategoryId ?? null;
        state.categoryName = product.category?.name ?? null;
      }

      state.items.push(product);
      saveToStorage(state);
    },

    removeFromCompare: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter((p) => p.id !== productId);

      // Reset category if list is now empty
      if (state.items.length === 0) {
        state.categoryId = null;
        state.categoryName = null;
      }
      saveToStorage(state);
    },

    clearCompare: (state) => {
      state.items = [];
      state.categoryId = null;
      state.categoryName = null;
      saveToStorage(state);
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;

// Selectors
export const selectCompareItems = (state: { compare: CompareState }) => state.compare.items;
export const selectCompareCount = (state: { compare: CompareState }) => state.compare.items.length;
export const selectCompareCategoryId = (state: { compare: CompareState }) => state.compare.categoryId;
export const selectCompareCategoryName = (state: { compare: CompareState }) => state.compare.categoryName;
export const selectIsInCompare = (productId: number) => (state: { compare: CompareState }) =>
  state.compare.items.some((p) => p.id === productId);
export const selectCanAddToCompare = (product: Product) => (state: { compare: CompareState }) => {
  if (state.compare.items.length >= MAX_COMPARE_ITEMS) return false;
  if (state.compare.items.some((p) => p.id === product.id)) return false;
  if (state.compare.categoryId !== null && product.category?.id !== state.compare.categoryId) return false;
  return true;
};

export const MAX_COMPARE = MAX_COMPARE_ITEMS;
export default compareSlice.reducer;
