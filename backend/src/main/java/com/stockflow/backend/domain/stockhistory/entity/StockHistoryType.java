package com.stockflow.backend.domain.stockhistory.entity;

public enum StockHistoryType {
    IN("입고"),
    OUT("출고"),
    MOVE("이동"),
    RETURN("반품"),
    DISPOSE("폐기");

    private final String description;

    StockHistoryType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}