package com.stockflow.backend.domain.order.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class OrderRequestDto {

    @NotNull(message = "매장 ID는 필수입니다.")
    private Long storeId;

    private String note;

    @NotNull(message = "발주 상세는 필수입니다.")
    private List<OrderItemDto> items;

    @Getter
    @NoArgsConstructor
    public static class OrderItemDto {

        @NotNull(message = "상품 옵션 ID는 필수입니다.")
        private Long productOptionId;

        @NotNull(message = "수량은 필수입니다.")
        private int quantity;
    }
}