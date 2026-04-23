package com.stockflow.backend.domain.order.controller;

import com.stockflow.backend.domain.order.dto.OrderRequestDto;
import com.stockflow.backend.domain.order.dto.OrderResponseDto;
import com.stockflow.backend.domain.order.service.OrderService;
import com.stockflow.backend.global.docs.order.OrderApiSpecification;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController implements OrderApiSpecification {

    private final OrderService orderService;

    // 발주 요청
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @RequestBody @Valid OrderRequestDto request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.create(request, email));
    }

    // 발주 전체 조회
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getOrders() {
        return ResponseEntity.ok(orderService.findAll());
    }

    // 발주 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    // 발주 승인
    @PatchMapping("/{id}/approve")
    public ResponseEntity<OrderResponseDto> approveOrder(
            @PathVariable Long id,
            @RequestParam Long approvedById) {
        return ResponseEntity.ok(orderService.approve(id, approvedById));
    }

    // 발주 반려
    @PatchMapping("/{id}/reject")
    public ResponseEntity<OrderResponseDto> rejectOrder(
            @PathVariable Long id,
            @RequestParam Long approvedById) {
        return ResponseEntity.ok(orderService.reject(id, approvedById));
    }

    // 발주 출고
    @PatchMapping("/{id}/ship")
    public ResponseEntity<OrderResponseDto> shipOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.ship(id));
    }

    // 발주 입고완료
    @PatchMapping("/{id}/receive")
    public ResponseEntity<OrderResponseDto> receiveOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.receive(id));
    }
}