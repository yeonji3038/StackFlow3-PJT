package com.stockflow.backend.global.kafka.consumer;

import com.stockflow.backend.global.kafka.dto.StockChangeEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class StockEventConsumer {

    @KafkaListener(topics = "stock-change-events", groupId = "stockflow-group")
    public void consume(StockChangeEvent event) {

        // 메시지 수신 로그
        log.info("[Kafka] 수신 - productId: {}, 변동량: {}, 현재고: {}",
                event.getProductId(),
                event.getChangedAmount(),
                event.getCurrentStock());

        if (event.getCurrentStock() < 10) {
            log.warn("[Kafka] 재고 부족 경고 - productId: {}, 현재고: {}",
                    event.getProductId(), event.getCurrentStock());
        }
    }
}