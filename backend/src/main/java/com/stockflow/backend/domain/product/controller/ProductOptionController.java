package com.stockflow.backend.domain.product.controller;

import com.stockflow.backend.domain.product.dto.ProductOptionRequestDto;
import com.stockflow.backend.domain.product.dto.ProductOptionResponseDto;
import com.stockflow.backend.domain.product.service.ProductOptionService;
import com.stockflow.backend.global.docs.product.ProductOptionApiSpecification;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/options")
@RequiredArgsConstructor
public class ProductOptionController implements ProductOptionApiSpecification {

    private final ProductOptionService productOptionService;

    // 옵션 생성
    @PostMapping
    public ResponseEntity<ProductOptionResponseDto> createProductOption(
            @PathVariable Long productId,
            @RequestBody @Valid ProductOptionRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productOptionService.create(productId, request));
    }

    // 특정 상품 옵션 전체 조회
    @GetMapping
    public ResponseEntity<List<ProductOptionResponseDto>> getProductOptions(
            @PathVariable Long productId) {
        return ResponseEntity.ok(productOptionService.findAllByProductId(productId));
    }

    // 옵션 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<ProductOptionResponseDto> getProductOption(
            @PathVariable Long productId,
            @PathVariable Long id) {
        return ResponseEntity.ok(productOptionService.findById(id));
    }

    // 옵션 수정
    @PutMapping("/{id}")
    public ResponseEntity<ProductOptionResponseDto> updateProductOption(
            @PathVariable Long productId,
            @PathVariable Long id,
            @RequestBody @Valid ProductOptionRequestDto request) {
        return ResponseEntity.ok(productOptionService.update(id, request));
    }

    // 옵션 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductOption(
            @PathVariable Long productId,
            @PathVariable Long id) {
        productOptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}