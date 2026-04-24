package com.stockflow.backend.domain.product.dto;

import com.stockflow.backend.domain.product.entity.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDto {

    @NotBlank(message = "상품명은 필수입니다.")
    private String name;

    @NotNull(message = "브랜드 ID는 필수입니다.")
    private Long brandId;

    @NotNull(message = "카테고리 ID는 필수입니다.")
    private Long categoryId;

    @NotNull(message = "시즌 ID는 필수입니다.")
    private Long seasonId;

    @NotNull(message = "판매가는 필수입니다.")
    private int price;

    @NotNull(message = "원가는 필수입니다.")
    private int cost;

    private String description;

    @NotNull(message = "상품 상태는 필수입니다.")
    private ProductStatus status;
}