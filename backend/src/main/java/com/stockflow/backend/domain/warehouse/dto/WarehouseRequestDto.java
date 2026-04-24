package com.stockflow.backend.domain.warehouse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseRequestDto {

    @NotBlank(message = "창고명은 필수입니다.")
    private String name;

    private String location;

    @NotNull(message = "담당자 ID는 필수입니다.")
    private Long managerId;
}