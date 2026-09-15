package com.computershop.controller;

import com.computershop.config.CustomUserDetailsService.CustomUserPrincipal;
import com.computershop.dto.response.ApiResponse;
import com.computershop.dto.response.ProductResponse;
import com.computershop.service.interfaces.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@Slf4j
public class WishlistController {

    private final WishlistService wishlistService;

    /**
     * Thêm sản phẩm vào wishlist
     */
    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        Long userId = principal.getUserId();
        wishlistService.addToWishlist(userId, productId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<Void>builder()
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Đã thêm sản phẩm vào danh sách yêu thích")
                        .build());
    }

    /**
     * Bỏ sản phẩm khỏi wishlist
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        Long userId = principal.getUserId();
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Đã bỏ sản phẩm khỏi danh sách yêu thích")
                .build());
    }

    /**
     * Lấy danh sách sản phẩm yêu thích của user hiện tại
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getWishlist(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        Long userId = principal.getUserId();
        List<ProductResponse> products = wishlistService.getWishlist(userId);
        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Lấy danh sách yêu thích thành công")
                .data(products)
                .build());
    }

    /**
     * Batch check: kiểm tra những productId nào nằm trong wishlist của user
     * Dùng để hiển thị trạng thái tim đã tô màu khi load trang danh sách sản phẩm
     */
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<List<Long>>> checkWishlistStatus(
            @RequestParam List<Long> productIds,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        Long userId = principal.getUserId();
        List<Long> wishlistedIds = wishlistService.checkWishlistStatus(userId, productIds);
        return ResponseEntity.ok(ApiResponse.<List<Long>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Kiểm tra trạng thái yêu thích thành công")
                .data(wishlistedIds)
                .build());
    }
}
