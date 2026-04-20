package com.stockflow.backend.domain.store.dto;

import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.store.entity.StoreType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class StoreResponseDto {

    private Long id;
    private String name;
    private String location;
    private StoreType storeType;
    private String phone;
    private LocalDateTime createdAt;

    public static StoreResponseDto from(Store store) {
        return StoreResponseDto.builder()
                .id(store.getId())
                .name(store.getName())
                .location(store.getLocation())
                .storeType(store.getStoreType())
                .phone(store.getPhone())
                .createdAt(store.getCreatedAt())
                .build();
    }
}