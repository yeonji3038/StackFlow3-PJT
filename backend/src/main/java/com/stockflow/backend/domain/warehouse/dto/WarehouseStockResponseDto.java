package com.stockflow.backend.domain.warehouse.dto;

import com.stockflow.backend.domain.warehouse.entity.WarehouseStock;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WarehouseStockResponseDto {

    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private Long productOptionId;
    private String skuCode;
    private String productName;
    private String color;
    private String size;
    private int quantity;

    public static WarehouseStockResponseDto from(WarehouseStock warehouseStock) {
        return WarehouseStockResponseDto.builder()
                .id(warehouseStock.getId())
                .warehouseId(warehouseStock.getWarehouse().getId())
                .warehouseName(warehouseStock.getWarehouse().getName())
                .productOptionId(warehouseStock.getProductOption().getId())
                .skuCode(warehouseStock.getProductOption().getSkuCode())
                .productName(warehouseStock.getProductOption().getProduct().getName())
                .color(warehouseStock.getProductOption().getColor())
                .size(warehouseStock.getProductOption().getSize().name())
                .quantity(warehouseStock.getQuantity())
                .build();
    }
}