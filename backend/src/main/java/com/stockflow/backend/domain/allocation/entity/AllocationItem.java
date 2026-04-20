package com.stockflow.backend.domain.allocation.entity;

import com.stockflow.backend.domain.product.entity.ProductOption;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "allocation_items")
public class AllocationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocation_id")
    private Allocation allocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_option_id")
    private ProductOption productOption;

    private int quantity;

    public void updateQuantity(int quantity) {
        this.quantity = quantity;
    }
}