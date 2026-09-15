package com.computershop.service.impl;

import com.computershop.dto.response.ProductResponse;
import com.computershop.entity.Product;
import com.computershop.entity.User;
import com.computershop.entity.Wishlist;
import com.computershop.repository.ProductRepository;
import com.computershop.repository.UserRepository;
import com.computershop.repository.WishlistRepository;
import com.computershop.service.interfaces.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void addToWishlist(Long userId, Long productId) {
        // Idempotent: nếu đã tồn tại thì bỏ qua
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            log.debug("Sản phẩm {} đã có trong wishlist của user {}", productId, userId);
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + productId));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        wishlistRepository.save(wishlist);
        log.info("Đã thêm sản phẩm {} vào wishlist của user {}", productId, userId);
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        log.info("Đã bỏ sản phẩm {} khỏi wishlist của user {}", productId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getWishlist(Long userId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserIdWithProduct(userId);
        return wishlists.stream()
                .map(w -> ProductResponse.fromEntity(w.getProduct()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> checkWishlistStatus(Long userId, List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyList();
        }
        return wishlistRepository.findProductIdsByUserIdAndProductIdIn(userId, productIds);
    }

    @Override
    @Transactional(readOnly = true)
    public long countWishlistItems(Long userId) {
        return wishlistRepository.countByUserId(userId);
    }
}
