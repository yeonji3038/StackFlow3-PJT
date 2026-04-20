package com.stockflow.backend.domain.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "product_options")
public class ProductOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private String color;

    @Enumerated(EnumType.STRING)
    private ProductSize size;

    @Column(unique = true)
    private String skuCode;

    @Enumerated(EnumType.STRING)
    private ProductOptionStatus status;

    public void update(String color, ProductSize size, String skuCode, ProductOptionStatus status) {
        this.color = color;
        this.size = size;
        this.skuCode = skuCode;
        this.status = status;
    }
}