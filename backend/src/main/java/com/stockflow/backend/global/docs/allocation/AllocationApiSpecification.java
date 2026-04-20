package com.stockflow.backend.global.docs.allocation;

import com.stockflow.backend.domain.allocation.dto.AllocationRequestDto;
import com.stockflow.backend.domain.allocation.dto.AllocationResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "배분", description = "본사 → 매장 배분 관리 API")
public interface AllocationApiSpecification {

    @Operation(summary = "배분 요청", description = """
        💡 본사 창고에서 매장으로 상품을 배분 요청합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **warehouseId** : 출고 창고 ID
        - **storeId** : 입고 매장 ID
        - **requestedById** : 요청자 ID
        - **items** : 배분 상세 목록
            - **productOptionId** : 상품 옵션 ID (SKU)
            - **quantity** : 배분 수량
        
        **[ 응답 필드 ]**
        - **id** : 배분 ID
        - **warehouseId** : 창고 ID
        - **warehouseName** : 창고명
        - **storeId** : 매장 ID
        - **storeName** : 매장명
        - **status** : 배분 상태
            - 요청 → **REQUESTED**
            - 승인 → **APPROVED**
            - 출고 → **SHIPPED**
            - 입고완료 → **RECEIVED**
            - 취소 → **CANCELLED**
        - **requestedById** : 요청자 ID
        - **requestedByName** : 요청자 이름
        - **approvedById** : 승인자 ID
        - **approvedByName** : 승인자 이름
        - **items** : 배분 상세 목록
        - **createdAt** : 배분 요청일시
        - **updatedAt** : 수정일시
        """)
    @PostMapping
    ResponseEntity<AllocationResponseDto> createAllocation(@RequestBody @Valid AllocationRequestDto request);

    @Operation(summary = "배분 전체 조회", description = """
        💡 전체 배분 목록을 조회합니다.
        
        ---
        
        **[ 응답 필드 ]**
        - **id** : 배분 ID
        - **warehouseName** : 창고명
        - **storeName** : 매장명
        - **status** : 배분 상태
        - **requestedByName** : 요청자 이름
        - **approvedByName** : 승인자 이름
        - **items** : 배분 상세 목록
        - **createdAt** : 배분 요청일시
        """)
    @GetMapping
    ResponseEntity<List<AllocationResponseDto>> getAllocations();

    @Operation(summary = "배분 단건 조회", description = """
        💡 ID로 배분을 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 조회할 배분 ID
        
        **[ 응답 필드 ]**
        - **id** : 배분 ID
        - **warehouseName** : 창고명
        - **storeName** : 매장명
        - **status** : 배분 상태
        - **requestedByName** : 요청자 이름
        - **approvedByName** : 승인자 이름
        - **items** : 배분 상세 목록
        - **createdAt** : 배분 요청일시
        """)
    @GetMapping("/{id}")
    ResponseEntity<AllocationResponseDto> getAllocation(@PathVariable Long id);

    @Operation(summary = "배분 승인", description = """
        💡 배분 요청을 승인합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 승인할 배분 ID
        - **approvedById** : 승인자 ID
        
        **[ 응답 필드 ]**
        - **id** : 배분 ID
        - **status** : 배분 상태 → **APPROVED**
        - **approvedByName** : 승인자 이름
        """)
    @PatchMapping("/{id}/approve")
    ResponseEntity<AllocationResponseDto> approveAllocation(
            @PathVariable Long id,
            @RequestParam Long approvedById);

    @Operation(summary = "배분 출고", description = """
        💡 배분을 출고 처리합니다. 창고 재고가 차감됩니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 출고할 배분 ID
        
        **[ 응답 필드 ]**
        - **id** : 배분 ID
        - **status** : 배분 상태 → **SHIPPED**
        """)
    @PatchMapping("/{id}/ship")
    ResponseEntity<AllocationResponseDto> shipAllocation(@PathVariable Long id);

    @Operation(summary = "배분 입고완료", description = """
        💡 배분 입고를 완료 처리합니다. 매장 재고가 추가됩니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 입고완료할 배분 ID
        
        **[ 응답 필드 ]**
        - **id** : 배분 ID
        - **status** : 배분 상태 → **RECEIVED**
        """)
    @PatchMapping("/{id}/receive")
    ResponseEntity<AllocationResponseDto> receiveAllocation(@PathVariable Long id);

    @Operation(summary = "배분 취소", description = """
        💡 배분을 취소합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 취소할 배분 ID
        
        **[ 응답 필드 ]**
        - **id** : 배분 ID
        - **status** : 배분 상태 → **CANCELLED**
        """)
    @PatchMapping("/{id}/cancel")
    ResponseEntity<AllocationResponseDto> cancelAllocation(@PathVariable Long id);
}