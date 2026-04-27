package com.stockflow.backend.domain.store.repository;

import com.stockflow.backend.domain.store.entity.StoreStock;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreStockRepository extends JpaRepository<StoreStock, Long> {

    // 특정 매장의 전체 재고 조회
    @EntityGraph(attributePaths = {"store", "productOption", "productOption.product"})
    List<StoreStock> findByStoreId(@Param("storeId") Long storeId);

    // 특정 매장의 특정 상품 옵션 재고 조회
    Optional<StoreStock> findByStoreIdAndProductOptionId(Long storeId, Long productOptionId);
}