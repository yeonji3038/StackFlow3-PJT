package com.stockflow.backend.global.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    // 배분 상태 변경 알림 → /topic/allocations 구독자에게 전송
    public void sendAllocationUpdate(Long allocationId, String status) {
        Map<String, Object> payload = Map.of(
                "allocationId", allocationId,
                "status", status
        );
        log.info("WebSocket 배분 상태 변경 알림: id={}, status={}", allocationId, status);
        messagingTemplate.convertAndSend("/topic/allocations", payload);
    }

    // 저재고 알림 → /topic/low-stock 구독자에게 전송
    public void sendLowStockAlert(Long warehouseId, String warehouseName, String skuCode, int quantity) {
        Map<String, Object> payload = Map.of(
                "warehouseId", warehouseId,
                "warehouseName", warehouseName,
                "skuCode", skuCode,
                "quantity", quantity
        );
        log.info("WebSocket 저재고 알림: warehouse={}, sku={}, qty={}", warehouseName, skuCode, quantity);
        messagingTemplate.convertAndSend("/topic/low-stock", payload);
    }

    // 대시보드 갱신 트리거 → /topic/dashboard 구독자에게 전송
    public void sendDashboardUpdate() {
        Map<String, Object> payload = Map.of(
                "type", "REFRESH",
                "timestamp", System.currentTimeMillis()
        );
        log.info("WebSocket 대시보드 갱신 트리거");
        messagingTemplate.convertAndSend("/topic/dashboard", payload);
    }
}