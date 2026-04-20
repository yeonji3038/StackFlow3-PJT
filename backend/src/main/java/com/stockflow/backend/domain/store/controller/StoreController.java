package com.stockflow.backend.domain.store.controller;

import com.stockflow.backend.domain.store.dto.StoreRequestDto;
import com.stockflow.backend.domain.store.dto.StoreResponseDto;
import com.stockflow.backend.domain.store.service.StoreService;
import com.stockflow.backend.global.docs.store.StoreApiSpecification;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController implements StoreApiSpecification {

    private final StoreService storeService;

    // 매장 생성
    @PostMapping
    public ResponseEntity<StoreResponseDto> createStore(
            @RequestBody @Valid StoreRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeService.create(request));
    }

    // 매장 전체 조회
    @GetMapping
    public ResponseEntity<List<StoreResponseDto>> getStores() {
        return ResponseEntity.ok(storeService.findAll());
    }

    // 매장 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<StoreResponseDto> getStore(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.findById(id));
    }

    // 매장 수정
    @PutMapping("/{id}")
    public ResponseEntity<StoreResponseDto> updateStore(
            @PathVariable Long id,
            @RequestBody @Valid StoreRequestDto request) {
        return ResponseEntity.ok(storeService.update(id, request));
    }

    // 매장 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id) {
        storeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}