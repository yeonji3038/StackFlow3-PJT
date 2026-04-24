package com.stockflow.backend.domain.store.dto;

import com.stockflow.backend.domain.store.entity.StoreType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StoreRequestDto {

    @NotBlank(message = "매장명은 필수입니다.")
    private String name;

    private String location;

    @NotNull(message = "매장 유형은 필수입니다.")
    private StoreType storeType;

    private String phone;
}