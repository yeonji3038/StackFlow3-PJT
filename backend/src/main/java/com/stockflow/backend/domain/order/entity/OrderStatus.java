package com.stockflow.backend.domain.order.entity;

public enum OrderStatus {
    REQUESTED("요청"),
    APPROVED("승인"),
    REJECTED("반려"),
    SHIPPED("출고"),
    RECEIVED("입고완료");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}