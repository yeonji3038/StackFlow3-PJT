package com.stockflow.backend.domain.stockhistory.service;

import com.stockflow.backend.domain.stockhistory.dto.StockHistoryResponseDto;
import com.stockflow.backend.domain.stockhistory.entity.StockHistory;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryReason;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryType;
import com.stockflow.backend.domain.stockhistory.repository.StockHistoryRepository;
import com.stockflow.backend.domain.product.entity.ProductOption;
import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockHistoryService {

    private final StockHistoryRepository stockHistoryRepository;

    // 이력 저장 (내부에서 호출)
    @Transactional
    public void record(Store store, Warehouse warehouse, ProductOption productOption,
                       StockHistoryType type, StockHistoryReason reason,
                       int quantity, User createdBy) {
        StockHistory history = StockHistory.builder()
                .store(store)
                .warehouse(warehouse)
                .productOption(productOption)
                .type(type)
                .reason(reason)
                .quantity(quantity)
                .createdBy(createdBy)
                .build();

        stockHistoryRepository.save(history);
    }

    // 전체 이력 조회
    public List<StockHistoryResponseDto> findAll() {
        return stockHistoryRepository.findAll().stream()
                .map(StockHistoryResponseDto::from)
                .collect(Collectors.toList());
    }

    // 매장별 이력 조회
    public List<StockHistoryResponseDto> findByStoreId(Long storeId) {
        return stockHistoryRepository.findByStoreId(storeId).stream()
                .map(StockHistoryResponseDto::from)
                .collect(Collectors.toList());
    }

    // 창고별 이력 조회
    public List<StockHistoryResponseDto> findByWarehouseId(Long warehouseId) {
        return stockHistoryRepository.findByWarehouseId(warehouseId).stream()
                .map(StockHistoryResponseDto::from)
                .collect(Collectors.toList());
    }

    // 상품 옵션별 이력 조회
    public List<StockHistoryResponseDto> findByProductOptionId(Long productOptionId) {
        return stockHistoryRepository.findByProductOptionId(productOptionId).stream()
                .map(StockHistoryResponseDto::from)
                .collect(Collectors.toList());
    }
}