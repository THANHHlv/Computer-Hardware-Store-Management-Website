package com.computershop.service.impl;

import com.computershop.dto.response.ProductResponse;
import com.computershop.entity.Product;
import com.computershop.repository.ProductRepository;
import com.computershop.service.interfaces.RecommendationService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements RecommendationService {

    private final ProductRepository productRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "recommendations", key = "'related_' + #productId + '_' + #limit")
    public List<ProductResponse> getRelatedProducts(Long productId, int limit) {
        log.debug("Lấy sản phẩm liên quan cho productId={}, limit={}", productId, limit);

        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Product currentProduct = productOpt.get();
        Long categoryId = currentProduct.getCategory().getId();
        BigDecimal price = currentProduct.getPrice();

        // Query products in same category, ordered by price proximity, exclude self
        String jpql = """
            SELECT p FROM Product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.images
            WHERE p.category.id = :categoryId
              AND p.id != :productId
              AND p.isActive = true
            ORDER BY ABS(p.price - :price) ASC
        """;

        List<Product> related = entityManager.createQuery(jpql, Product.class)
                .setParameter("categoryId", categoryId)
                .setParameter("productId", productId)
                .setParameter("price", price)
                .setMaxResults(limit)
                .getResultList();

        // Fallback: if not enough, fill with random active products from other categories
        if (related.size() < limit) {
            int remaining = limit - related.size();
            List<Long> existingIds = related.stream().map(Product::getId).collect(Collectors.toList());
            existingIds.add(productId);

            String fallbackJpql = """
                SELECT p FROM Product p
                LEFT JOIN FETCH p.category
                LEFT JOIN FETCH p.images
                WHERE p.id NOT IN :existingIds
                  AND p.isActive = true
                ORDER BY FUNCTION('RANDOM')
            """;

            List<Product> fallback = entityManager.createQuery(fallbackJpql, Product.class)
                    .setParameter("existingIds", existingIds)
                    .setMaxResults(remaining)
                    .getResultList();

            related.addAll(fallback);
        }

        return related.stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "recommendations", key = "'fbt_' + #productId + '_' + #limit")
    public List<ProductResponse> getFrequentlyBoughtTogether(Long productId, int limit) {
        log.debug("Lấy sản phẩm thường mua cùng cho productId={}, limit={}", productId, limit);

        // Native query: find products frequently ordered together
        String nativeSql = """
            SELECT oi2.product_id, COUNT(*) as freq
            FROM order_items oi1
            JOIN order_items oi2 ON oi1.order_id = oi2.order_id
            WHERE oi1.product_id = :productId
              AND oi2.product_id != :productId
            GROUP BY oi2.product_id
            ORDER BY freq DESC
            LIMIT :limit
        """;

        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(nativeSql)
                .setParameter("productId", productId)
                .setParameter("limit", limit)
                .getResultList();

        if (results.isEmpty()) {
            log.debug("Không có dữ liệu mua cùng cho productId={}, fallback về related", productId);
            return getRelatedProducts(productId, limit);
        }

        List<Long> productIds = results.stream()
                .map(row -> ((Number) row[0]).longValue())
                .toList();

        // Load full product entities
        String jpql = """
            SELECT p FROM Product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.images
            WHERE p.id IN :productIds
              AND p.isActive = true
        """;

        List<Product> products = entityManager.createQuery(jpql, Product.class)
                .setParameter("productIds", productIds)
                .getResultList();

        // Preserve order from frequency ranking
        return productIds.stream()
                .map(id -> products.stream().filter(p -> p.getId().equals(id)).findFirst())
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(ProductResponse::fromEntity)
                .toList();
    }
}
