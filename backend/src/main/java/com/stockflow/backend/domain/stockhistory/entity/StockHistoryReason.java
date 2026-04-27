package com.stockflow.backend.domain.stockhistory.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum StockHistoryReason {
    ALLOCATION("배분"),
    ORDER("발주"),
    SALE("판매"),
    RETURN("반품"),
    DAMAGE("불량"),
    SEASON_END("시즌종료"),
    LOST("분실"),
    ETC("기타");

    private final String description;

    StockHistoryReason(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    @JsonCreator
    public static StockHistoryReason from(String value) {
        for (StockHistoryReason reason : values()) {
            if (reason.description.equals(value) || reason.name().equals(value)) {
                return reason;
            }
        }
        throw new IllegalArgumentException("유효하지 않은 재고 변동 사유: " + value);
    }
}