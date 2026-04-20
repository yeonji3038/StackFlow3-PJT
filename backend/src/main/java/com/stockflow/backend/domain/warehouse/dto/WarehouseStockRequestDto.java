package com.stockflow.backend.domain.warehouse.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WarehouseStockRequestDto {

    @NotNull(message = "창고 ID는 필수입니다.")
    private Long warehouseId;

    @NotNull(message = "상품 옵션 ID는 필수입니다.")
    private Long productOptionId;

    @NotNull(message = "수량은 필수입니다.")
    private int quantity;
}