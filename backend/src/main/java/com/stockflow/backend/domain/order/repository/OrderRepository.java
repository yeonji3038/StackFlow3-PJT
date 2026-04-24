package com.stockflow.backend.domain.order.repository;

import com.stockflow.backend.domain.order.entity.Order;
import com.stockflow.backend.domain.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // 특정 매장의 발주 목록 조회
    List<Order> findByStoreId(Long storeId);

    // 상태별 발주 목록 조회
    List<Order> findByStatus(OrderStatus status);
}