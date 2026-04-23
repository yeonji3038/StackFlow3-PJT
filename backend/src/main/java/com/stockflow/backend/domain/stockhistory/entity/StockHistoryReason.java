package com.stockflow.backend.domain.stockhistory.entity;

public enum StockHistoryReason {
    ALLOCATION("배분"),
    ORDER("발주"),
    SALE("판매"),
    RETURN("반품"),
    DAMAGE("손상"),
    SEASON_END("시즌종료");

    private final String description;

    StockHistoryReason(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}