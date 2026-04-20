package com.stockflow.backend.domain.product.dto;

import com.stockflow.backend.domain.product.entity.ProductOptionStatus;
import com.stockflow.backend.domain.product.entity.ProductSize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProductOptionRequestDto {

    @NotBlank(message = "색상은 필수입니다.")
    private String color;

    @NotNull(message = "사이즈는 필수입니다.")
    private ProductSize size;

    @NotBlank(message = "SKU 코드는 필수입니다.")
    private String skuCode;

    @NotNull(message = "옵션 상태는 필수입니다.")
    private ProductOptionStatus status;
}