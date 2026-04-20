package com.stockflow.backend.domain.brand.dto;

import com.stockflow.backend.domain.brand.entity.Brand;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BrandResponseDto {

    private Long id;
    private String name;
    private String description;

    public static BrandResponseDto from(Brand brand) {
        return BrandResponseDto.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .build();
    }
}