package com.stockflow.backend.domain.order.dto;

import com.stockflow.backend.domain.order.entity.Order;
import com.stockflow.backend.domain.order.entity.OrderItem;
import com.stockflow.backend.domain.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class OrderResponseDto {

    private Long id;
    private Long storeId;
    private String storeName;
    private OrderStatus status;
    private String statusDescription;
    private Long requestedById;
    private String requestedByName;
    private Long approvedById;
    private String approvedByName;
    private String note;
    private List<OrderItemResponseDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponseDto from(Order order, List<OrderItem> items) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .storeId(order.getStore().getId())
                .storeName(order.getStore().getName())
                .status(order.getStatus())
                .statusDescription(order.getStatus().getDescription())
                .requestedById(order.getRequestedBy().getId())
                .requestedByName(order.getRequestedBy().getName())
                .approvedById(order.getApprovedBy() != null ? order.getApprovedBy().getId() : null)
                .approvedByName(order.getApprovedBy() != null ? order.getApprovedBy().getName() : null)
                .note(order.getNote())
                .items(items.stream().map(OrderItemResponseDto::from).collect(Collectors.toList()))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    @Getter
    @Builder
    public static class OrderItemResponseDto {

        private Long id;
        private Long productOptionId;
        private String skuCode;
        private String productName;
        private String color;
        private String size;
        private int quantity;

        public static OrderItemResponseDto from(OrderItem item) {
            return OrderItemResponseDto.builder()
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