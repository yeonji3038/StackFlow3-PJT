package com.stockflow.backend.domain.season.dto;

import com.stockflow.backend.domain.season.entity.SeasonStatus;
import com.stockflow.backend.domain.season.entity.SeasonType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SeasonRequestDto {

    @NotBlank(message = "시즌명은 필수입니다.")
    private String name;

    @NotNull(message = "시즌 유형은 필수입니다.")
    private SeasonType type;

    @NotNull(message = "연도는 필수입니다.")
    private int year;

    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull(message = "시즌 상태는 필수입니다.")
    private SeasonStatus status;
}