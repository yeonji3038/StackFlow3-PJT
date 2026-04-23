package com.stockflow.backend.domain.warehouse.repository;

import com.stockflow.backend.domain.warehouse.entity.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {

    // 특정 창고의 전체 재고 조회
    List<WarehouseStock> findByWarehouseId(Long warehouseId);

    // 특정 창고의 특정 상품 옵션 재고 조회
    Optional<WarehouseStock> findByWarehouseIdAndProductOptionId(Long warehouseId, Long productOptionId);

    // 특정 상품 옵션의 창고 재고 전체 조회
    List<WarehouseStock> findByProductOptionId(Long productOptionId);
}