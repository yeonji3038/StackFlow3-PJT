package com.stockflow.backend.domain.warehouse.controller;

import com.stockflow.backend.domain.warehouse.dto.WarehouseStockRequestDto;
import com.stockflow.backend.domain.warehouse.dto.WarehouseStockResponseDto;
import com.stockflow.backend.domain.warehouse.service.WarehouseStockService;
import com.stockflow.backend.global.docs.warehouse.WarehouseStockApiSpecification;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses/{warehouseId}/stocks")
@RequiredArgsConstructor
public class WarehouseStockController implements WarehouseStockApiSpecification {

    private final WarehouseStockService warehouseStockService;

    // 창고 재고 등록
    @PostMapping
    public ResponseEntity<WarehouseStockResponseDto> createWarehouseStock(
            @PathVariable Long warehouseId,
            @RequestBody @Valid WarehouseStockRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(warehouseStockService.create(request));
    }

    // 특정 창고 재고 전체 조회
    @GetMapping
    public ResponseEntity<List<WarehouseStockResponseDto>> getWarehouseStocks(
            @PathVariable Long warehouseId) {
        return ResponseEntity.ok(warehouseStockService.findAllByWarehouseId(warehouseId));
    }

    // 창고 재고 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<WarehouseStockResponseDto> getWarehouseStock(
            @PathVariable Long warehouseId,
            @PathVariable Long id) {
        return ResponseEntity.ok(warehouseStockService.findById(id));
    }

    // 창고 재고 수량 수정
    @PutMapping("/{id}")
    public ResponseEntity<WarehouseStockResponseDto> updateWarehouseStock(
            @PathVariable Long warehouseId,
            @PathVariable Long id,
            @RequestBody @Valid WarehouseStockRequestDto request) {
        return ResponseEntity.ok(warehouseStockService.update(id, request));
    }

    // 창고 재고 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouseStock(
            @PathVariable Long warehouseId,
            @PathVariable Long id) {
        warehouseStockService.delete(id);
        return ResponseEntity.noContent().build();
    }
}