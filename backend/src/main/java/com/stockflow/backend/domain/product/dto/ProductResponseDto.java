package com.stockflow.backend.domain.product.dto;

import com.stockflow.backend.domain.product.entity.Product;
import com.stockflow.backend.domain.product.entity.ProductStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProductResponseDto {

    private Long id;
    private String name;
    private Long brandId;
    private String brandName;
    private Long categoryId;
    private String categoryName;
    private Long seasonId;
    private String seasonName;
    private int price;
    private int cost;
    private String description;
    private ProductStatus status;
    private LocalDateTime createdAt;

    public static ProductResponseDto from(Product product) {
        return ProductResponseDto.builder()
                .id(product.getId())
                .name(product.getName())
                .brandId(product.getBrand().getId())
                .brandName(product.getBrand().getName())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .seasonId(product.getSeason().getId())
                .seasonName(product.getSeason().getName())
                .price(product.getPrice())
                .cost(product.getCost())
                .description(product.getDescription())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .build();
    }
}