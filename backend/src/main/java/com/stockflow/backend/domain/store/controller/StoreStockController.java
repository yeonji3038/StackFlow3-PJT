package com.stockflow.backend.domain.store.controller;

import com.stockflow.backend.domain.store.dto.StoreStockRequestDto;
import com.stockflow.backend.domain.store.dto.StoreStockResponseDto;
import com.stockflow.backend.domain.store.service.StoreStockService;
import com.stockflow.backend.global.docs.store.StoreStockApiSpecification;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores/{storeId}/stocks")
@RequiredArgsConstructor
public class StoreStockController implements StoreStockApiSpecification {

    private final StoreStockService storeStockService;

    // 매장 재고 등록
    @PostMapping
    public ResponseEntity<StoreStockResponseDto> createStoreStock(
            @PathVariable Long storeId,
            @RequestBody @Valid StoreStockRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeStockService.create(request));
    }

    // 특정 매장 재고 전체 조회
    @GetMapping
    public ResponseEntity<List<StoreStockResponseDto>> getStoreStocks(
            @PathVariable Long storeId) {
        return ResponseEntity.ok(storeStockService.findAllByStoreId(storeId));
    }

    // 매장 재고 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<StoreStockResponseDto> getStoreStock(
            @PathVariable Long storeId,
            @PathVariable Long id) {
        return ResponseEntity.ok(storeStockService.findById(id));
    }

    // 매장 재고 수량 수정
    @PutMapping("/{id}")
    public ResponseEntity<StoreStockResponseDto> updateStoreStock(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @RequestBody @Valid StoreStockRequestDto request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(storeStockService.update(id, request, email));
    }

    // 매장 재고 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStoreStock(
            @PathVariable Long storeId,
            @PathVariable Long id) {
        storeStockService.delete(id);
        return ResponseEntity.noContent().build();
    }
}