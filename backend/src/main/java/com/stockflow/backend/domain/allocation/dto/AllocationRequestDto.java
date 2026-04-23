package com.stockflow.backend.domain.allocation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class AllocationRequestDto {

    @NotNull(message = "창고 ID는 필수입니다.")
    private Long warehouseId;

    @NotNull(message = "매장 ID는 필수입니다.")
    private Long storeId;


    @NotNull(message = "배분 상세는 필수입니다.")
    private List<AllocationItemDto> items;

    @Getter
    @NoArgsConstructor
    public static class AllocationItemDto {

        @NotNull(message = "상품 옵션 ID는 필수입니다.")
        private Long productOptionId;

        @NotNull(message = "수량은 필수입니다.")
        private int quantity;
    }
}