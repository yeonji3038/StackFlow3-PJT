package com.stockflow.backend.global.kafka.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockChangeEvent {

    private Long productId;       // 어떤 상품인지 (상품 ID)
    private String productName;   // 상품 이름
    private int previousStock;    // 변동 전 재고량
    private int changedAmount;    // 변동된 수량 (입고 +, 출고 -)
    private int currentStock;     // 변동 후 현재 재고량
    private String changeType;    // 변동 유형: "INCREASE"(입고) | "DECREASE"(출고)
    private LocalDateTime timestamp; // 이벤트 발생 시각
}