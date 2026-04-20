package com.stockflow.backend.global.docs.warehouse;

import com.stockflow.backend.domain.warehouse.dto.WarehouseStockRequestDto;
import com.stockflow.backend.domain.warehouse.dto.WarehouseStockResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "창고 재고", description = "창고 재고 관리 API")
public interface WarehouseStockApiSpecification {

    @Operation(summary = "창고 재고 등록", description = """
        💡 창고에 상품 옵션 재고를 등록합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **warehouseId** : 창고 ID
        - **productOptionId** : 상품 옵션 ID (SKU)
        - **quantity** : 재고 수량
        
        **[ 응답 필드 ]**
        - **id** : 창고 재고 ID
        - **warehouseId** : 창고 ID
        - **warehouseName** : 창고명
        - **productOptionId** : 상품 옵션 ID
        - **skuCode** : SKU 코드
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **quantity** : 재고 수량
        """)
    @PostMapping
    ResponseEntity<WarehouseStockResponseDto> createWarehouseStock(
            @PathVariable Long warehouseId,
            @RequestBody @Valid WarehouseStockRequestDto request);

    @Operation(summary = "창고 재고 전체 조회", description = """
        💡 특정 창고의 전체 재고 목록을 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **warehouseId** : 조회할 창고 ID
        
        **[ 응답 필드 ]**
        - **id** : 창고 재고 ID
        - **warehouseId** : 창고 ID
        - **warehouseName** : 창고명
        - **productOptionId** : 상품 옵션 ID
        - **skuCode** : SKU 코드
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **quantity** : 재고 수량
        """)
    @GetMapping
    ResponseEntity<List<WarehouseStockResponseDto>> getWarehouseStocks(
            @PathVariable Long warehouseId);

    @Operation(summary = "창고 재고 단건 조회", description = """
        💡 ID로 창고 재고를 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **warehouseId** : 창고 ID
        - **id** : 조회할 창고 재고 ID
        
        **[ 응답 필드 ]**
        - **id** : 창고 재고 ID
        - **warehouseId** : 창고 ID
        - **warehouseName** : 창고명
        - **productOptionId** : 상품 옵션 ID
        - **skuCode** : SKU 코드
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **quantity** : 재고 수량
        """)
    @GetMapping("/{id}")
    ResponseEntity<WarehouseStockResponseDto> getWarehouseStock(
            @PathVariable Long warehouseId,
            @PathVariable Long id);

    @Operation(summary = "창고 재고 수정", description = """
        💡 창고 재고 수량을 수정합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **warehouseId** : 창고 ID
        - **id** : 수정할 창고 재고 ID
        - **quantity** : 변경할 재고 수량
        
        **[ 응답 필드 ]**
        - **id** : 창고 재고 ID
        - **warehouseId** : 창고 ID
        - **warehouseName** : 창고명
        - **productOptionId** : 상품 옵션 ID
        - **skuCode** : SKU 코드
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **quantity** : 재고 수량
        """)
    @PutMapping("/{id}")
    ResponseEntity<WarehouseStockResponseDto> updateWarehouseStock(
            @PathVariable Long warehouseId,
            @PathVariable Long id,
            @RequestBody @Valid WarehouseStockRequestDto request);

    @Operation(summary = "창고 재고 삭제", description = """
        💡 창고 재고를 삭제합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **warehouseId** : 창고 ID
        - **id** : 삭제할 창고 재고 ID
        """)
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWarehouseStock(
            @PathVariable Long warehouseId,
            @PathVariable Long id);
}