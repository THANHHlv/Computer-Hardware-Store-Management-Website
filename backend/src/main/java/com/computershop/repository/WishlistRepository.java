package com.computershop.repository;

import com.computershop.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    @Query("SELECT w FROM Wishlist w " +
           "JOIN FETCH w.product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.images " +
           "WHERE w.user.id = :userId " +
           "ORDER BY w.createdAt DESC")
    List<Wishlist> findByUserIdWithProduct(@Param("userId") Long userId);

    Optional<Wishlist> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @Modifying
    @Query("DELETE FROM Wishlist w WHERE w.user.id = :userId AND w.product.id = :productId")
    void deleteByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);

    @Query("SELECT w.product.id FROM Wishlist w WHERE w.user.id = :userId AND w.product.id IN :productIds")
    List<Long> findProductIdsByUserIdAndProductIdIn(@Param("userId") Long userId, @Param("productIds") List<Long> productIds);

    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
