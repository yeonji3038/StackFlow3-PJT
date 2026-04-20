package com.stockflow.backend.domain.category.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CategoryRequestDto {

    @NotBlank(message = "카테고리명은 필수입니다.")
    private String name;

    private Long parentId; // 대분류면 null, 소분류면 상위 카테고리 ID
}