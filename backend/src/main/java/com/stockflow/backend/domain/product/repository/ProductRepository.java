package com.stockflow.backend.domain.product.repository;

import com.stockflow.backend.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}