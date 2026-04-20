package com.stockflow.backend.domain.allocation.dto;

import com.stockflow.backend.domain.allocation.entity.Allocation;
import com.stockflow.backend.domain.allocation.entity.AllocationItem;
import com.stockflow.backend.domain.allocation.entity.AllocationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class AllocationResponseDto {

    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private Long storeId;
    private String storeName;
    private AllocationStatus status;
    private Long requestedById;
    private String requestedByName;
    private Long approvedById;
    private String approvedByName;
    private List<AllocationItemResponseDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AllocationResponseDto from(Allocation allocation, List<AllocationItem> items) {
        return AllocationResponseDto.builder()
                .id(allocation.getId())
                .warehouseId(allocation.getWarehouse().getId())
                .warehouseName(allocation.getWarehouse().getName())
                .storeId(allocation.getStore().getId())
                .storeName(allocation.getStore().getName())
                .status(allocation.getStatus())
                .requestedById(allocation.getRequestedBy().getId())
                .requestedByName(allocation.getRequestedBy().getName())
                .approvedById(allocation.getApprovedBy() != null ? allocation.getApprovedBy().getId() : null)
                .approvedByName(allocation.getApprovedBy() != null ? allocation.getApprovedBy().getName() : null)
                .items(items.stream().map(AllocationItemResponseDto::from).collect(Collectors.toList()))
                .createdAt(allocation.getCreatedAt())
                .updatedAt(allocation.getUpdatedAt())
                .build();
    }

    @Getter
    @Builder
    public static class AllocationItemResponseDto {

        private Long id;
        private Long productOptionId;
        private String skuCode;
        private String productName;
        private String color;
        private String size;
        private int quantity;

        public static AllocationItemResponseDto from(AllocationItem item) {
            return AllocationItemResponseDto.builder()
                    .id(item.getId())
                    .productOptionId(item.getProductOption().getId())
                    .skuCode(item.getProductOption().getSkuCode())
                    .productName(item.getProductOption().getProduct().getName())
                    .color(item.getProductOption().getColor())
                    .size(item.getProductOption().getSize().name())
                    .quantity(item.getQuantity())
                    .build();
        }
    }
}