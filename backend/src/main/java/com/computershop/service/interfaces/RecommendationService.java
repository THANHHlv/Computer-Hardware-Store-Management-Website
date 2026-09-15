package com.computershop.service.interfaces;

import com.computershop.dto.response.ProductResponse;

import java.util.List;

public interface RecommendationService {

    /**
     * Lấy danh sách sản phẩm liên quan (cùng category, giá gần nhất).
     * Fallback random nếu không đủ.
     */
    List<ProductResponse> getRelatedProducts(Long productId, int limit);

    /**
     * Lấy danh sách sản phẩm thường được mua cùng (dựa trên order_items).
     * Fallback về related nếu không có dữ liệu.
     */
    List<ProductResponse> getFrequentlyBoughtTogether(Long productId, int limit);
}
