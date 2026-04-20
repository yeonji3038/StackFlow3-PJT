package com.stockflow.backend.global.docs.product;

import com.stockflow.backend.domain.product.dto.ProductOptionRequestDto;
import com.stockflow.backend.domain.product.dto.ProductOptionResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "상품 옵션", description = "상품 옵션(SKU) 관리 API")
public interface ProductOptionApiSpecification {

    @Operation(summary = "상품 옵션 생성", description = """
        💡 특정 상품의 옵션(SKU)을 등록합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **productId** : 옵션을 등록할 상품 ID
        - **color** : 색상 (예: 블랙, 화이트, 네이비)
        - **size** : 사이즈
            - **XS**, **S**, **M**, **L**, **XL**, **XXL**
        - **skuCode** : SKU 코드 (바코드/QR 기준, 중복 불가)
        - **status** : 옵션 상태
            - 판매중 → **ON_SALE**
            - 단종 → **DISCONTINUED**
        
        **[ 응답 필드 ]**
        - **id** : 옵션 ID
        - **productId** : 상품 ID
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **skuCode** : SKU 코드
        - **status** : 옵션 상태
        """)
    @PostMapping
    ResponseEntity<ProductOptionResponseDto> createProductOption(
            @PathVariable Long productId,
            @RequestBody @Valid ProductOptionRequestDto request);

    @Operation(summary = "상품 옵션 전체 조회", description = """
        💡 특정 상품의 전체 옵션 목록을 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **productId** : 조회할 상품 ID
        
        **[ 응답 필드 ]**
        - **id** : 옵션 ID
        - **productId** : 상품 ID
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **skuCode** : SKU 코드
        - **status** : 옵션 상태
        """)
    @GetMapping
    ResponseEntity<List<ProductOptionResponseDto>> getProductOptions(
            @PathVariable Long productId);

    @Operation(summary = "상품 옵션 단건 조회", description = """
        💡 옵션 ID로 단건 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **productId** : 상품 ID
        - **id** : 조회할 옵션 ID
        
        **[ 응답 필드 ]**
        - **id** : 옵션 ID
        - **productId** : 상품 ID
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **skuCode** : SKU 코드
        - **status** : 옵션 상태
        """)
    @GetMapping("/{id}")
    ResponseEntity<ProductOptionResponseDto> getProductOption(
            @PathVariable Long productId,
            @PathVariable Long id);

    @Operation(summary = "상품 옵션 수정", description = """
        💡 상품 옵션 정보를 수정합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **productId** : 상품 ID
        - **id** : 수정할 옵션 ID
        - **color** : 색상
        - **size** : 사이즈
            - **XS**, **S**, **M**, **L**, **XL**, **XXL**
        - **skuCode** : SKU 코드
        - **status** : 옵션 상태
            - 판매중 → **ON_SALE**
            - 단종 → **DISCONTINUED**
        
        **[ 응답 필드 ]**
        - **id** : 옵션 ID
        - **productId** : 상품 ID
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **skuCode** : SKU 코드
        - **status** : 옵션 상태
        """)
    @PutMapping("/{id}")
    ResponseEntity<ProductOptionResponseDto> updateProductOption(
            @PathVariable Long productId,
            @PathVariable Long id,
            @RequestBody @Valid ProductOptionRequestDto request);

    @Operation(summary = "상품 옵션 삭제", description = """
        💡 상품 옵션을 삭제합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **productId** : 상품 ID
        - **id** : 삭제할 옵션 ID
        """)
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteProductOption(
            @PathVariable Long productId,
            @PathVariable Long id);
}