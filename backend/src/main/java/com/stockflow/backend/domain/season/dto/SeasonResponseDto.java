package com.stockflow.backend.domain.season.dto;

import com.stockflow.backend.domain.season.entity.Season;
import com.stockflow.backend.domain.season.entity.SeasonStatus;
import com.stockflow.backend.domain.season.entity.SeasonType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class SeasonResponseDto {

    private Long id;
    private String name;
    private SeasonType type;
    private int year;
    private LocalDate startDate;
    private LocalDate endDate;
    private SeasonStatus status;

    public static SeasonResponseDto from(Season season) {
        return SeasonResponseDto.builder()
                .id(season.getId())
                .name(season.getName())
                .type(season.getType())
                .year(season.getYear())
                .startDate(season.getStartDate())
                .endDate(season.getEndDate())
                .status(season.getStatus())
                .build();
    }
}