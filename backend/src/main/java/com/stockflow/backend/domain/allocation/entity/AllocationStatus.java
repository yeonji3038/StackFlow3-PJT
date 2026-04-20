package com.stockflow.backend.domain.allocation.entity;

public enum AllocationStatus {
    REQUESTED,  // 요청
    APPROVED,   // 승인
    SHIPPED,    // 출고
    RECEIVED,   // 입고완료
    CANCELLED   // 취소
}