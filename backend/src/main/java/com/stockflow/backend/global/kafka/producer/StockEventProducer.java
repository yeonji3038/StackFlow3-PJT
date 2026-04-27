package com.stockflow.backend.global.kafka.producer;

import com.stockflow.backend.global.kafka.dto.StockChangeEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockEventProducer {

    private static final String TOPIC = "stock-change-events";

    private final KafkaTemplate<String, StockChangeEvent> kafkaTemplate;

    public void sendStockChangeEvent(StockChangeEvent event) {

        kafkaTemplate.send(TOPIC, String.valueOf(event.getProductId()), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        // 전송 실패 시 에러 로그
                        log.error("[Kafka] 전송 실패 - productId: {}, error: {}",
                                event.getProductId(), ex.getMessage());
                    } else {
                        // 전송 성공 시 offset 로그
                        log.info("[Kafka] 전송 성공 - productId: {}, offset: {}",
                                event.getProductId(),
                                result.getRecordMetadata().offset());
                    }
                });
    }
}