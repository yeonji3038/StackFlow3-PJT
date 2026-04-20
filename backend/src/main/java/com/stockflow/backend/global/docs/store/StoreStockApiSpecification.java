package com.stockflow.backend.global.docs.store;

import com.stockflow.backend.domain.store.dto.StoreStockRequestDto;
import com.stockflow.backend.domain.store.dto.StoreStockResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "매장 재고", description = "매장 재고 관리 API")
public interface StoreStockApiSpecification {

    @Operation(summary = "매장 재고 등록", description = """
        💡 매장에 상품 옵션 재고를 등록합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **storeId** : 매장 ID
        - **productOptionId** : 상품 옵션 ID (SKU)
        - **quantity** : 재고 수량
        
        **[ 응답 필드 ]**
        - **id** : 매장 재고 ID
        - **storeId** : 매장 ID
        - **storeName** : 매장명
        - **productOptionId** : 상품 옵션 ID
        - **skuCode** : SKU 코드
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **quantity** : 재고 수량
        """)
    @PostMapping
    ResponseEntity<StoreStockResponseDto> createStoreStock(
            @PathVariable Long storeId,
            @RequestBody @Valid StoreStockRequestDto request);

    @Operation(summary = "매장 재고 전체 조회", description = """
        💡 특정 매장의 전체 재고 목록을 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **storeId** : 조회할 매장 ID
        
        **[ 응답 필드 ]**
        - **id** : 매장 재고 ID
        - **storeId** : 매장 ID
        - **storeName** : 매장명
        - **productOptionId** : 상품 옵션 ID
        - **skuCode** : SKU 코드
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **quantity** : 재고 수량
        """)
    @GetMapping
    ResponseEntity<List<StoreStockResponseDto>> getStoreStocks(
            @PathVariable Long storeId);

    @Operation(summary = "매장 재고 단건 조회", description = """
        💡 ID로 매장 재고를 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **storeId** : 매장 ID
        - **id** : 조회할 매장 재고 ID
        
        **[ 응답 필드 ]**
        - **id** : 매장 재고 ID
        - **storeId** : 매장 ID
        - **storeName** : 매장명
        - **productOptionId** : 상품 옵션 ID
        - **skuCode** : SKU 코드
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **quantity** : 재고 수량
        """)
    @GetMapping("/{id}")
    ResponseEntity<StoreStockResponseDto> getStoreStock(
            @PathVariable Long storeId,
            @PathVariable Long id);

    @Operation(summary = "매장 재고 수정", description = """
        💡 매장 재고 수량을 수정합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **storeId** : 매장 ID
        - **id** : 수정할 매장 재고 ID
        - **quantity** : 변경할 재고 수량
        
        **[ 응답 필드 ]**
        - **id** : 매장 재고 ID
        - **storeId** : 매장 ID
        - **storeName** : 매장명
        - **productOptionId** : 상품 옵션 ID
        - **skuCode** : SKU 코드
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **quantity** : 재고 수량
        """)
    @PutMapping("/{id}")
    ResponseEntity<StoreStockResponseDto> updateStoreStock(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @RequestBody @Valid StoreStockRequestDto request);

    @Operation(summary = "매장 재고 삭제", description = """
        💡 매장 재고를 삭제합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **storeId** : 매장 ID
        - **id** : 삭제할 매장 재고 ID
        """)
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteStoreStock(
            @PathVariable Long storeId,
            @PathVariable Long id);
}