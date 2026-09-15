package com.computershop.service.interfaces;

import com.computershop.dto.response.ProductResponse;

import java.util.List;

public interface WishlistService {

    /**
     * Thêm sản phẩm vào wishlist. Idempotent — nếu đã có thì bỏ qua.
     */
    void addToWishlist(Long userId, Long productId);

    /**
     * Bỏ sản phẩm khỏi wishlist.
     */
    void removeFromWishlist(Long userId, Long productId);

    /**
     * Lấy danh sách sản phẩm trong wishlist của user.
     */
    List<ProductResponse> getWishlist(Long userId);

    /**
     * Batch check: trả về danh sách productId nào đang nằm trong wishlist của user.
     */
    List<Long> checkWishlistStatus(Long userId, List<Long> productIds);

    /**
     * Đếm số lượng sản phẩm trong wishlist.
     */
    long countWishlistItems(Long userId);
}
