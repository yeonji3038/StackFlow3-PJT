package com.stockflow.backend.domain.stockhistory.controller;

import com.stockflow.backend.domain.stockhistory.dto.StockHistoryResponseDto;
import com.stockflow.backend.domain.stockhistory.service.StockHistoryService;
import com.stockflow.backend.global.docs.stockhistory.StockHistoryApiSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-history")
@RequiredArgsConstructor
public class StockHistoryController implements StockHistoryApiSpecification {

    private final StockHistoryService stockHistoryService;

    // 전체 이력 조회
    @GetMapping
    public ResponseEntity<List<StockHistoryResponseDto>> getStockHistories() {
        return ResponseEntity.ok(stockHistoryService.findAll());
    }

    // 매장별 이력 조회
    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<StockHistoryResponseDto>> getStockHistoriesByStore(
            @PathVariable Long storeId) {
        return ResponseEntity.ok(stockHistoryService.findByStoreId(storeId));
    }

    // 창고별 이력 조회
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<StockHistoryResponseDto>> getStockHistoriesByWarehouse(
            @PathVariable Long warehouseId) {
        return ResponseEntity.ok(stockHistoryService.findByWarehouseId(warehouseId));
    }

    // 상품 옵션별 이력 조회
    @GetMapping("/product-option/{productOptionId}")
    public ResponseEntity<List<StockHistoryResponseDto>> getStockHistoriesByProductOption(
            @PathVariable Long productOptionId) {
        return ResponseEntity.ok(stockHistoryService.findByProductOptionId(productOptionId));
    }
}