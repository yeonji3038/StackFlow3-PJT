package com.stockflow.backend.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // 공통
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "잘못된 입력값입니다."),

    // 사용자
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "이미 사용 중인 이메일입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "INVALID_PASSWORD", "이메일 또는 비밀번호가 올바르지 않습니다."),

    // JWT
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "EXPIRED_TOKEN", "만료된 토큰입니다."),
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND, "REFRESH_TOKEN_NOT_FOUND", "리프레시 토큰을 찾을 수 없습니다."),
    REFRESH_TOKEN_MISMATCH(HttpStatus.UNAUTHORIZED, "REFRESH_TOKEN_MISMATCH", "리프레시 토큰이 일치하지 않습니다."),

    // 브랜드
    BRAND_NOT_FOUND(HttpStatus.NOT_FOUND, "BRAND_NOT_FOUND", "브랜드를 찾을 수 없습니다."),

    // 카테고리
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "카테고리를 찾을 수 없습니다."),

    // 시즌
    SEASON_NOT_FOUND(HttpStatus.NOT_FOUND, "SEASON_NOT_FOUND", "시즌을 찾을 수 없습니다."),

    // 매장
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "STORE_NOT_FOUND", "매장을 찾을 수 없습니다."),

    // 상품
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "상품을 찾을 수 없습니다."),
    PRODUCT_OPTION_NOT_FOUND(HttpStatus.NOT_FOUND, "PRODUCT_OPTION_NOT_FOUND", "상품 옵션을 찾을 수 없습니다."),

    // 창고
    WAREHOUSE_NOT_FOUND(HttpStatus.NOT_FOUND, "WAREHOUSE_NOT_FOUND", "창고를 찾을 수 없습니다."),
    WAREHOUSE_STOCK_NOT_FOUND(HttpStatus.NOT_FOUND, "WAREHOUSE_STOCK_NOT_FOUND", "창고 재고를 찾을 수 없습니다."),
    WAREHOUSE_STOCK_INSUFFICIENT(HttpStatus.BAD_REQUEST, "WAREHOUSE_STOCK_INSUFFICIENT", "창고 재고가 부족합니다."),

    // 매장 재고
    STORE_STOCK_NOT_FOUND(HttpStatus.NOT_FOUND, "STORE_STOCK_NOT_FOUND", "매장 재고를 찾을 수 없습니다."),

    // 배분
    ALLOCATION_NOT_FOUND(HttpStatus.NOT_FOUND, "ALLOCATION_NOT_FOUND", "배분을 찾을 수 없습니다."),
    ALLOCATION_INVALID_STATUS(HttpStatus.BAD_REQUEST, "ALLOCATION_INVALID_STATUS", "현재 상태에서 처리할 수 없습니다."),
    ALLOCATION_ALREADY_CANCELLED(HttpStatus.BAD_REQUEST, "ALLOCATION_ALREADY_CANCELLED", "이미 취소된 배분입니다."),
    ALLOCATION_CANNOT_CANCEL(HttpStatus.BAD_REQUEST, "ALLOCATION_CANNOT_CANCEL", "입고완료된 배분은 취소할 수 없습니다."),

    // 발주
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND", "발주를 찾을 수 없습니다."),
    ORDER_INVALID_STATUS(HttpStatus.BAD_REQUEST, "ORDER_INVALID_STATUS", "현재 상태에서 처리할 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}