package com.stockflow.backend.domain.warehouse.dto;

import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WarehouseResponseDto {

    private Long id;
    private String name;
    private String location;
    private Long managerId;
    private String managerName;

    public static WarehouseResponseDto from(Warehouse warehouse) {
        return WarehouseResponseDto.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .location(warehouse.getLocation())
                .managerId(warehouse.getManager().getId())
                .managerName(warehouse.getManager().getName())
                .build();
    }
}