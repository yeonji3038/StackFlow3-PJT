package com.stockflow.backend.domain.stockhistory.repository;

import com.stockflow.backend.domain.stockhistory.entity.StockHistory;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {

    // 특정 매장의 이력 조회
    List<StockHistory> findByStoreId(Long storeId);

    // 특정 창고의 이력 조회
    List<StockHistory> findByWarehouseId(Long warehouseId);

    // 특정 상품 옵션의 이력 조회
    List<StockHistory> findByProductOptionId(Long productOptionId);

    // 변동 유형별 이력 조회
    List<StockHistory> findByType(StockHistoryType type);
}