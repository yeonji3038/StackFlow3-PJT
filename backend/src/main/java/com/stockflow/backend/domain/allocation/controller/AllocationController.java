package com.stockflow.backend.domain.allocation.controller;

import com.stockflow.backend.domain.allocation.dto.AllocationRequestDto;
import com.stockflow.backend.domain.allocation.dto.AllocationResponseDto;
import com.stockflow.backend.domain.allocation.service.AllocationService;
import com.stockflow.backend.global.docs.allocation.AllocationApiSpecification;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
public class AllocationController implements AllocationApiSpecification {

    private final AllocationService allocationService;

    // 배분 요청
    @PostMapping
    public ResponseEntity<AllocationResponseDto> createAllocation(
            @RequestBody @Valid AllocationRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(allocationService.create(request));
    }

    // 배분 전체 조회
    @GetMapping
    public ResponseEntity<List<AllocationResponseDto>> getAllocations() {
        return ResponseEntity.ok(allocationService.findAll());
    }

    // 배분 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<AllocationResponseDto> getAllocation(@PathVariable Long id) {
        return ResponseEntity.ok(allocationService.findById(id));
    }

    // 배분 승인
    @PatchMapping("/{id}/approve")
    public ResponseEntity<AllocationResponseDto> approveAllocation(
            @PathVariable Long id,
            @RequestParam Long approvedById) {
        return ResponseEntity.ok(allocationService.approve(id, approvedById));
    }

    // 배분 출고
    @PatchMapping("/{id}/ship")
    public ResponseEntity<AllocationResponseDto> shipAllocation(@PathVariable Long id) {
        return ResponseEntity.ok(allocationService.ship(id));
    }

    // 배분 입고완료
    @PatchMapping("/{id}/receive")
    public ResponseEntity<AllocationResponseDto> receiveAllocation(@PathVariable Long id) {
        return ResponseEntity.ok(allocationService.receive(id));
    }

    // 배분 취소
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AllocationResponseDto> cancelAllocation(@PathVariable Long id) {
        return ResponseEntity.ok(allocationService.cancel(id));
    }
}