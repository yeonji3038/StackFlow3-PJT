package com.stockflow.backend.domain.product.controller;

import com.stockflow.backend.domain.product.dto.ProductRequestDto;
import com.stockflow.backend.domain.product.dto.ProductResponseDto;
import com.stockflow.backend.domain.product.service.ProductService;
import com.stockflow.backend.global.docs.product.ProductApiSpecification;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController implements ProductApiSpecification {

    private final ProductService productService;

    // 상품 생성
    @PostMapping
    public ResponseEntity<ProductResponseDto> createProduct(
            @RequestBody @Valid ProductRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.create(request));
    }

    // 상품 전체 조회
    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getProducts() {
        return ResponseEntity.ok(productService.findAll());
    }

    // 상품 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    // 상품 수정
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long id,
            @RequestBody @Valid ProductRequestDto request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    // 상품 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}