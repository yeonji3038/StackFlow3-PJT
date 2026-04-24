package com.stockflow.backend.domain.stockhistory.dto;

import com.stockflow.backend.domain.stockhistory.entity.StockHistory;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryReason;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class StockHistoryResponseDto {

    private Long id;
    private Long storeId;
    private String storeName;
    private Long warehouseId;
    private String warehouseName;
    private Long productOptionId;
    private String skuCode;
    private String productName;
    private String color;
    private String size;
    private StockHistoryType type;
    private String typeDescription;
    private StockHistoryReason reason;
    private String reasonDescription;
    private int quantity;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;

    public static StockHistoryResponseDto from(StockHistory history) {
        return StockHistoryResponseDto.builder()
                .id(history.getId())
                .storeId(history.getStore() != null ? history.getStore().getId() : null)
                .storeName(history.getStore() != null ? history.getStore().getName() : null)
                .warehouseId(history.getWarehouse() != null ? history.getWarehouse().getId() : null)
                .warehouseName(history.getWarehouse() != null ? history.getWarehouse().getName() : null)
                .productOptionId(history.getProductOption().getId())
                .skuCode(history.getProductOption().getSkuCode())
                .productName(history.getProductOption().getProduct().getName())
                .color(history.getProductOption().getColor())
                .size(history.getProductOption().getSize().name())
                .type(history.getType())
                .typeDescription(history.getType().getDescription())
                .reason(history.getReason())
                .reasonDescription(history.getReason().getDescription())
                .quantity(history.getQuantity())
                .createdById(history.getCreatedBy() != null ? history.getCreatedBy().getId() : null)
                .createdByName(history.getCreatedBy() != null ? history.getCreatedBy().getName() : null)
                .createdAt(history.getCreatedAt())
                .build();
    }
}