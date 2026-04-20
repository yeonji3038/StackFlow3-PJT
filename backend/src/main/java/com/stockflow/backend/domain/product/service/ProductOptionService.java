package com.stockflow.backend.domain.product.service;

import com.stockflow.backend.domain.product.dto.ProductOptionRequestDto;
import com.stockflow.backend.domain.product.dto.ProductOptionResponseDto;
import com.stockflow.backend.domain.product.entity.Product;
import com.stockflow.backend.domain.product.entity.ProductOption;
import com.stockflow.backend.domain.product.repository.ProductOptionRepository;
import com.stockflow.backend.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductOptionService {

    private final ProductOptionRepository productOptionRepository;
    private final ProductRepository productRepository;

    // 상품 옵션 생성
    @Transactional
    public ProductOptionResponseDto create(Long productId, ProductOptionRequestDto request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        ProductOption productOption = ProductOption.builder()
                .product(product)
                .color(request.getColor())
                .size(request.getSize())
                .skuCode(request.getSkuCode())
                .status(request.getStatus())
                .build();

        return ProductOptionResponseDto.from(productOptionRepository.save(productOption));
    }

    // 특정 상품의 옵션 전체 조회
    public List<ProductOptionResponseDto> findAllByProductId(Long productId) {
        return productOptionRepository.findByProductId(productId).stream()
                .map(ProductOptionResponseDto::from)
                .collect(Collectors.toList());
    }

    // 옵션 단건 조회
    public ProductOptionResponseDto findById(Long id) {
        ProductOption productOption = productOptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품 옵션을 찾을 수 없습니다."));
        return ProductOptionResponseDto.from(productOption);
    }

    // 옵션 수정
    @Transactional
    public ProductOptionResponseDto update(Long id, ProductOptionRequestDto request) {
        ProductOption productOption = productOptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품 옵션을 찾을 수 없습니다."));
        productOption.update(request.getColor(), request.getSize(),
                request.getSkuCode(), request.getStatus());
        return ProductOptionResponseDto.from(productOption);
    }

    // 옵션 삭제
    @Transactional
    public void delete(Long id) {
        if (!productOptionRepository.existsById(id)) {
            throw new RuntimeException("상품 옵션을 찾을 수 없습니다.");
        }
        productOptionRepository.deleteById(id);
    }
}