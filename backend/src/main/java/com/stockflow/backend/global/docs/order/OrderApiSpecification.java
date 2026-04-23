package com.stockflow.backend.global.docs.order;

import com.stockflow.backend.domain.order.dto.OrderRequestDto;
import com.stockflow.backend.domain.order.dto.OrderResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "발주", description = "매장 → 본사 발주 관리 API")
public interface OrderApiSpecification {

    @Operation(summary = "발주 요청", description = """
        💡 매장에서 본사로 상품을 발주 요청합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **storeId** : 요청 매장 ID
        - **requestedById** : 요청자 ID
        - **note** : 요청 메모 (선택)
        - **items** : 발주 상세 목록
            - **productOptionId** : 상품 옵션 ID (SKU)
            - **quantity** : 발주 수량
        
        **[ 응답 필드 ]**
        - **id** : 발주 ID
        - **storeId** : 매장 ID
        - **storeName** : 매장명
        - **status** : 발주 상태
            - 요청 → **REQUESTED**
            - 승인 → **APPROVED**
            - 반려 → **REJECTED**
            - 출고 → **SHIPPED**
            - 입고완료 → **RECEIVED**
        - **statusDescription** : 발주 상태 한국어
        - **requestedById** : 요청자 ID
        - **requestedByName** : 요청자 이름
        - **approvedById** : 승인자 ID
        - **approvedByName** : 승인자 이름
        - **note** : 요청 메모
        - **items** : 발주 상세 목록
        - **createdAt** : 발주 요청일시
        - **updatedAt** : 수정일시
        """)
    @PostMapping
    ResponseEntity<OrderResponseDto> createOrder(@RequestBody @Valid OrderRequestDto request);

    @Operation(summary = "발주 전체 조회", description = """
        💡 전체 발주 목록을 조회합니다.
        
        ---
        
        **[ 응답 필드 ]**
        - **id** : 발주 ID
        - **storeName** : 매장명
        - **status** : 발주 상태
        - **statusDescription** : 발주 상태 한국어
        - **requestedByName** : 요청자 이름
        - **approvedByName** : 승인자 이름
        - **note** : 요청 메모
        - **items** : 발주 상세 목록
        - **createdAt** : 발주 요청일시
        """)
    @GetMapping
    ResponseEntity<List<OrderResponseDto>> getOrders();

    @Operation(summary = "발주 단건 조회", description = """
        💡 ID로 발주를 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 조회할 발주 ID
        
        **[ 응답 필드 ]**
        - **id** : 발주 ID
        - **storeName** : 매장명
        - **status** : 발주 상태
        - **statusDescription** : 발주 상태 한국어
        - **requestedByName** : 요청자 이름
        - **approvedByName** : 승인자 이름
        - **note** : 요청 메모
        - **items** : 발주 상세 목록
        - **createdAt** : 발주 요청일시
        """)
    @GetMapping("/{id}")
    ResponseEntity<OrderResponseDto> getOrder(@PathVariable Long id);

    @Operation(summary = "발주 승인", description = """
        💡 발주 요청을 승인합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 승인할 발주 ID
        - **approvedById** : 승인자 ID
        
        **[ 응답 필드 ]**
        - **id** : 발주 ID
        - **status** : 발주 상태 → **APPROVED**
        - **statusDescription** : 승인
        - **approvedByName** : 승인자 이름
        """)
    @PatchMapping("/{id}/approve")
    ResponseEntity<OrderResponseDto> approveOrder(
            @PathVariable Long id,
            @RequestParam Long approvedById);

    @Operation(summary = "발주 반려", description = """
        💡 발주 요청을 반려합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 반려할 발주 ID
        - **approvedById** : 처리자 ID
        
        **[ 응답 필드 ]**
        - **id** : 발주 ID
        - **status** : 발주 상태 → **REJECTED**
        - **statusDescription** : 반려
        - **approvedByName** : 처리자 이름
        """)
    @PatchMapping("/{id}/reject")
    ResponseEntity<OrderResponseDto> rejectOrder(
            @PathVariable Long id,
            @RequestParam Long approvedById);

    @Operation(summary = "발주 출고", description = """
        💡 발주를 출고 처리합니다. 창고 재고가 차감됩니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 출고할 발주 ID
        
        **[ 응답 필드 ]**
        - **id** : 발주 ID
        - **status** : 발주 상태 → **SHIPPED**
        - **statusDescription** : 출고
        """)
    @PatchMapping("/{id}/ship")
    ResponseEntity<OrderResponseDto> shipOrder(@PathVariable Long id);

    @Operation(summary = "발주 입고완료", description = """
        💡 발주 입고를 완료 처리합니다. 매장 재고가 증가합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 입고완료할 발주 ID
        
        **[ 응답 필드 ]**
        - **id** : 발주 ID
        - **status** : 발주 상태 → **RECEIVED**
        - **statusDescription** : 입고완료
        """)
    @PatchMapping("/{id}/receive")
    ResponseEntity<OrderResponseDto> receiveOrder(@PathVariable Long id);
}