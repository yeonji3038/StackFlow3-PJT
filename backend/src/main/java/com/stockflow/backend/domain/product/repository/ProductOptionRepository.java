package com.stockflow.backend.domain.product.repository;

import com.stockflow.backend.domain.product.entity.ProductOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductOptionRepository extends JpaRepository<ProductOption, Long> {
    //특정 상품의 옵션 전체 조회
    List<ProductOption> findByProductId(Long productId);
}
