package com.stockflow.backend.domain.product.entity;

import com.stockflow.backend.domain.brand.entity.Brand;
import com.stockflow.backend.domain.category.entity.Category;
import com.stockflow.backend.domain.season.entity.Season;
import com.stockflow.backend.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "products")
public class Product extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id")
    private Season season;

    private int price;

    private int cost;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    public void update(String name, Brand brand, Category category, Season season,
                       int price, int cost, String description, ProductStatus status) {
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.season = season;
        this.price = price;
        this.cost = cost;
        this.description = description;
        this.status = status;
    }
}