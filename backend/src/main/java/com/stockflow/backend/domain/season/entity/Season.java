package com.stockflow.backend.domain.season.entity;

import com.stockflow.backend.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "seasons")
public class Season extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // SS25, FW25

    @Enumerated(EnumType.STRING)
    private SeasonType type; // 봄여름, 가을겨울

    private int year;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private SeasonStatus status; // 기획중, 진행중, 종료

    public void update(String name, SeasonType type, int year, LocalDate startDate, LocalDate endDate, SeasonStatus status) {
        this.name = name;
        this.type = type;
        this.year = year;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }
}