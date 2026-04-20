package com.stockflow.backend.domain.store.dto;

import com.stockflow.backend.domain.store.entity.StoreStock;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StoreStockResponseDto {

    private Long id;
    private Long storeId;
    private String storeName;
    private Long productOptionId;
    private String skuCode;
    private String productName;
    private String color;
    private String size;
    private int quantity;

    public static StoreStockResponseDto from(StoreStock storeStock) {
        return StoreStockResponseDto.builder()
                .id(storeStock.getId())
                .storeId(storeStock.getStore().getId())
                .storeName(storeStock.getStore().getName())
                .productOptionId(storeStock.getProductOption().getId())
                .skuCode(storeStock.getProductOption().getSkuCode())
                .productName(storeStock.getProductOption().getProduct().getName())
                .color(storeStock.getProductOption().getColor())
                .size(storeStock.getProductOption().getSize().name())
                .quantity(storeStock.getQuantity())
                .build();
    }
}