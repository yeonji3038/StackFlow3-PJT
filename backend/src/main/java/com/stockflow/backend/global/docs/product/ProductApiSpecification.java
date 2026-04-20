package com.stockflow.backend.global.docs.product;

import com.stockflow.backend.domain.product.dto.ProductRequestDto;
import com.stockflow.backend.domain.product.dto.ProductResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "상품", description = "상품 관리 API")
public interface ProductApiSpecification {

    @Operation(summary = "상품 생성", description = """
        💡 새로운 상품을 등록합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **name** : 상품명
        - **brandId** : 브랜드 ID
        - **categoryId** : 카테고리 ID
        - **seasonId** : 시즌 ID
        - **price** : 판매가
        - **cost** : 원가
        - **description** : 상품 설명
        - **status** : 상품 상태
            - 판매중 → **ON_SALE**
            - 단종 → **DISCONTINUED**
            - 아울렛 → **OUTLET**
        
        **[ 응답 필드 ]**
        - **id** : 상품 ID
        - **name** : 상품명
        - **brandId** : 브랜드 ID
        - **brandName** : 브랜드명
        - **categoryId** : 카테고리 ID
        - **categoryName** : 카테고리명
        - **seasonId** : 시즌 ID
        - **seasonName** : 시즌명
        - **price** : 판매가
        - **cost** : 원가
        - **description** : 상품 설명
        - **status** : 상품 상태
        - **createdAt** : 등록일시
        """)
    @PostMapping
    ResponseEntity<ProductResponseDto> createProduct(@RequestBody @Valid ProductRequestDto request);

    @Operation(summary = "상품 전체 조회", description = """
        💡 전체 상품 목록을 조회합니다.
        
        ---
        
        **[ 응답 필드 ]**
        - **id** : 상품 ID
        - **name** : 상품명
        - **brandName** : 브랜드명
        - **categoryName** : 카테고리명
        - **seasonName** : 시즌명
        - **price** : 판매가
        - **cost** : 원가
        - **status** : 상품 상태
        - **createdAt** : 등록일시
        """)
    @GetMapping
    ResponseEntity<List<ProductResponseDto>> getProducts();

    @Operation(summary = "상품 단건 조회", description = """
        💡 ID로 상품을 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 조회할 상품 ID
        
        **[ 응답 필드 ]**
        - **id** : 상품 ID
        - **name** : 상품명
        - **brandName** : 브랜드명
        - **categoryName** : 카테고리명
        - **seasonName** : 시즌명
        - **price** : 판매가
        - **cost** : 원가
        - **description** : 상품 설명
        - **status** : 상품 상태
        - **createdAt** : 등록일시
        """)
    @GetMapping("/{id}")
    ResponseEntity<ProductResponseDto> getProduct(@PathVariable Long id);

    @Operation(summary = "상품 수정", description = """
        💡 상품 정보를 수정합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 수정할 상품 ID
        - **name** : 상품명
        - **brandId** : 브랜드 ID
        - **categoryId** : 카테고리 ID
        - **seasonId** : 시즌 ID
        - **price** : 판매가
        - **cost** : 원가
        - **description** : 상품 설명
        - **status** : 상품 상태
            - 판매중 → **ON_SALE**
            - 단종 → **DISCONTINUED**
            - 아울렛 → **OUTLET**
        
        **[ 응답 필드 ]**
        - **id** : 상품 ID
        - **name** : 상품명
        - **brandName** : 브랜드명
        - **categoryName** : 카테고리명
        - **seasonName** : 시즌명
        - **price** : 판매가
        - **cost** : 원가
        - **description** : 상품 설명
        - **status** : 상품 상태
        - **createdAt** : 등록일시
        """)
    @PutMapping("/{id}")
    ResponseEntity<ProductResponseDto> updateProduct(@PathVariable Long id, @RequestBody @Valid ProductRequestDto request);

    @Operation(summary = "상품 삭제", description = """
        💡 상품을 삭제합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 삭제할 상품 ID
        """)
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteProduct(@PathVariable Long id);
}