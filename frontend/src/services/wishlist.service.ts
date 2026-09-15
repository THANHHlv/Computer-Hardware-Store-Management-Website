/**
 * ❤️ WISHLIST SERVICE - Computer Shop E-commerce
 * API calls for managing user's wishlist (favorite products)
 */

import { api } from './api';
import type { Product } from '../types/product.types';

export const wishlistService = {
  /**
   * Lấy danh sách sản phẩm yêu thích của user hiện tại
   */
  getWishlist: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/api/v1/wishlist', { skipCache: true } as any);
    return response.data || [];
  },

  /**
   * Thêm sản phẩm vào wishlist
   */
  addToWishlist: async (productId: number): Promise<void> => {
    await api.post<void>(`/api/v1/wishlist/${productId}`);
  },

  /**
   * Bỏ sản phẩm khỏi wishlist
   */
  removeFromWishlist: async (productId: number): Promise<void> => {
    await api.delete<void>(`/api/v1/wishlist/${productId}`);
  },

  /**
   * Batch check: kiểm tra những productId nào nằm trong wishlist
   * Dùng để hiển thị trạng thái tim khi load trang danh sách
   */
  checkWishlistStatus: async (productIds: number[]): Promise<number[]> => {
    if (!productIds.length) return [];
    const response = await api.get<number[]>('/api/v1/wishlist/check', {
      params: { productIds },
      skipCache: true,
    } as any);
    return response.data || [];
  },
};

export default wishlistService;
