package com.stockflow.backend.domain.warehouse.service;

import com.stockflow.backend.domain.product.entity.ProductOption;
import com.stockflow.backend.domain.product.repository.ProductOptionRepository;
import com.stockflow.backend.domain.warehouse.dto.WarehouseStockRequestDto;
import com.stockflow.backend.domain.warehouse.dto.WarehouseStockResponseDto;
import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import com.stockflow.backend.domain.warehouse.entity.WarehouseStock;
import com.stockflow.backend.domain.warehouse.repository.WarehouseRepository;
import com.stockflow.backend.domain.warehouse.repository.WarehouseStockRepository;
import com.stockflow.backend.global.exception.BusinessException;
import com.stockflow.backend.global.exception.ErrorCode;
import com.stockflow.backend.global.kafka.dto.StockChangeEvent;
import com.stockflow.backend.global.kafka.producer.StockEventProducer;
import com.stockflow.backend.global.websocket.StockWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseStockService {

    private final WarehouseStockRepository warehouseStockRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductOptionRepository productOptionRepository;
    private final StockWebSocketService stockWebSocketService;
    private final StockEventProducer stockEventProducer;

    private static final int LOW_STOCK_THRESHOLD = 10;

    // 창고 재고 등록
    @Transactional
    @CacheEvict(value = "warehouseStocks", key = "#request.warehouseId")
    public WarehouseStockResponseDto create(WarehouseStockRequestDto request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new BusinessException(ErrorCode.WAREHOUSE_NOT_FOUND));
        ProductOption productOption = productOptionRepository.findById(request.getProductOptionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_OPTION_NOT_FOUND));

        WarehouseStock warehouseStock = WarehouseStock.builder()
                .warehouse(warehouse)
                .productOption(productOption)
                .quantity(request.getQuantity())
                .build();

        WarehouseStock saved = warehouseStockRepository.save(warehouseStock);

        // WebSocket: 저재고 감지 시 알림
        if (saved.getQuantity() <= LOW_STOCK_THRESHOLD) {
            stockWebSocketService.sendLowStockAlert(
                    warehouse.getId(),
                    warehouse.getName(),
                    productOption.getSkuCode(),
                    saved.getQuantity()
            );
        }

        return WarehouseStockResponseDto.from(saved);
    }

    // 특정 창고 재고 전체 조회
    @Cacheable(value = "warehouseStocks", key = "#warehouseId")
    public List<WarehouseStockResponseDto> findAllByWarehouseId(Long warehouseId) {
        return warehouseStockRepository.findByWarehouseId(warehouseId).stream()
                .map(WarehouseStockResponseDto::from)
                .collect(Collectors.toList());
    }

    // 창고 재고 단건 조회
    public WarehouseStockResponseDto findById(Long id) {
        WarehouseStock warehouseStock = warehouseStockRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WAREHOUSE_STOCK_NOT_FOUND));
        return WarehouseStockResponseDto.from(warehouseStock);
    }

    // 창고 재고 수량 수정
    @Transactional
    @CacheEvict(value = "warehouseStocks", key = "#result.warehouseId")
    public WarehouseStockResponseDto update(Long id, WarehouseStockRequestDto request) {
        WarehouseStock warehouseStock = warehouseStockRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WAREHOUSE_STOCK_NOT_FOUND));

        // 변동량 계산을 위해 수정 전 수량 저장
        int oldQty = warehouseStock.getQuantity();
        int newQty = request.getQuantity();
        int diff = newQty - oldQty;

        warehouseStock.updateQuantity(request.getQuantity());

        // WebSocket: 저재고 감지 시 알림 + 대시보드 갱신
        if (request.getQuantity() <= LOW_STOCK_THRESHOLD) {
            stockWebSocketService.sendLowStockAlert(
                    warehouseStock.getWarehouse().getId(),
                    warehouseStock.getWarehouse().getName(),
                    warehouseStock.getProductOption().getSkuCode(),
                    request.getQuantity()
            );
            stockWebSocketService.sendDashboardUpdate();
        }
        // Kafka 이벤트 발행 (수량 변동이 있을 때만)
        if (diff != 0) {
            stockEventProducer.sendStockChangeEvent(
                    StockChangeEvent.builder()
                            .productId(warehouseStock.getProductOption().getId())
                            .productName(warehouseStock.getProductOption().getSkuCode())
                            .previousStock(oldQty)
                            .changedAmount(diff)
                            .currentStock(newQty)
                            .changeType(diff > 0 ? "INCREASE" : "DECREASE")
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        }

        return WarehouseStockResponseDto.from(warehouseStock);
    }

    // 창고 재고 삭제
    @Transactional
    @CacheEvict(value = "warehouseStocks", key = "#id")
    public void delete(Long id) {
        if (!warehouseStockRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.WAREHOUSE_STOCK_NOT_FOUND);
        }
        warehouseStockRepository.deleteById(id);
    }
}