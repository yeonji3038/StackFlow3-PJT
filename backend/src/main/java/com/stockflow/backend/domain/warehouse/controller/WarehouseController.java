package com.stockflow.backend.domain.warehouse.controller;

import com.stockflow.backend.domain.warehouse.dto.WarehouseRequestDto;
import com.stockflow.backend.domain.warehouse.dto.WarehouseResponseDto;
import com.stockflow.backend.domain.warehouse.service.WarehouseService;
import com.stockflow.backend.global.docs.warehouse.WarehouseApiSpecification;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController implements WarehouseApiSpecification {

    private final WarehouseService warehouseService;

    // 창고 생성
    @PostMapping
    public ResponseEntity<WarehouseResponseDto> createWarehouse(
            @RequestBody @Valid WarehouseRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(warehouseService.create(request));
    }

    // 창고 전체 조회
    @GetMapping
    public ResponseEntity<List<WarehouseResponseDto>> getWarehouses() {
        return ResponseEntity.ok(warehouseService.findAll());
    }

    // 창고 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<WarehouseResponseDto> getWarehouse(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.findById(id));
    }

    // 창고 수정
    @PutMapping("/{id}")
    public ResponseEntity<WarehouseResponseDto> updateWarehouse(
            @PathVariable Long id,
            @RequestBody @Valid WarehouseRequestDto request) {
        return ResponseEntity.ok(warehouseService.update(id, request));
    }

    // 창고 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}