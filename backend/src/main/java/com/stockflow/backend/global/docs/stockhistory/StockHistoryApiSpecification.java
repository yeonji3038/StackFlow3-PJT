package com.stockflow.backend.global.docs.stockhistory;

import com.stockflow.backend.domain.stockhistory.dto.StockHistoryResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "입출고 이력", description = "재고 입출고 이력 관리 API")
public interface StockHistoryApiSpecification {

    @Operation(summary = "전체 이력 조회", description = """
        💡 전체 재고 입출고 이력을 조회합니다.
        
        ---
        
        **[ 응답 필드 ]**
        - **id** : 이력 ID
        - **storeId** : 매장 ID (매장 이력일 경우)
        - **storeName** : 매장명
        - **warehouseId** : 창고 ID (창고 이력일 경우)
        - **warehouseName** : 창고명
        - **productOptionId** : 상품 옵션 ID
        - **skuCode** : SKU 코드
        - **productName** : 상품명
        - **color** : 색상
        - **size** : 사이즈
        - **type** : 변동 유형
            - 입고 → **IN**
            - 출고 → **OUT**
            - 이동 → **MOVE**
            - 반품 → **RETURN**
            - 폐기 → **DISPOSE**
        - **typeDescription** : 변동 유형 한국어
        - **reason** : 변동 사유
            - 배분 → **ALLOCATION**
            - 발주 → **ORDER**
            - 판매 → **SALE**
            - 반품 → **RETURN**
            - 손상 → **DAMAGE**
            - 시즌종료 → **SEASON_END**
        - **reasonDescription** : 변동 사유 한국어
        - **quantity** : 변동 수량
        - **createdById** : 처리자 ID
        - **createdByName** : 처리자 이름
        - **createdAt** : 처리일시
        """)
    @GetMapping
    ResponseEntity<List<StockHistoryResponseDto>> getStockHistories();

    @Operation(summary = "매장별 이력 조회", description = """
        💡 특정 매장의 재고 입출고 이력을 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **storeId** : 조회할 매장 ID
        
        **[ 응답 필드 ]**
        - 전체 이력 조회와 동일
        """)
    @GetMapping("/store/{storeId}")
    ResponseEntity<List<StockHistoryResponseDto>> getStockHistoriesByStore(@PathVariable Long storeId);

    @Operation(summary = "창고별 이력 조회", description = """
        💡 특정 창고의 재고 입출고 이력을 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **warehouseId** : 조회할 창고 ID
        
        **[ 응답 필드 ]**
        - 전체 이력 조회와 동일
        """)
    @GetMapping("/warehouse/{warehouseId}")
    ResponseEntity<List<StockHistoryResponseDto>> getStockHistoriesByWarehouse(@PathVariable Long warehouseId);

    @Operation(summary = "상품 옵션별 이력 조회", description = """
        💡 특정 상품 옵션의 재고 입출고 이력을 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **productOptionId** : 조회할 상품 옵션 ID
        
        **[ 응답 필드 ]**
        - 전체 이력 조회와 동일
        """)
    @GetMapping("/product-option/{productOptionId}")
    ResponseEntity<List<StockHistoryResponseDto>> getStockHistoriesByProductOption(@PathVariable Long productOptionId);
}