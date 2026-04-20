package com.stockflow.backend.domain.season.service;

import com.stockflow.backend.domain.season.dto.SeasonRequestDto;
import com.stockflow.backend.domain.season.dto.SeasonResponseDto;
import com.stockflow.backend.domain.season.entity.Season;
import com.stockflow.backend.domain.season.repository.SeasonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeasonService {

    private final SeasonRepository seasonRepository;

    // 시즌 생성
    @Transactional
    public SeasonResponseDto create(SeasonRequestDto request) {
        Season season = Season.builder()
                .name(request.getName())
                .type(request.getType())
                .year(request.getYear())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus())
                .build();
        return SeasonResponseDto.from(seasonRepository.save(season));
    }

    // 시즌 전체 조회
    public List<SeasonResponseDto> findAll() {
        return seasonRepository.findAll().stream()
                .map(SeasonResponseDto::from)
                .collect(Collectors.toList());
    }

    // 시즌 단건 조회
    public SeasonResponseDto findById(Long id) {
        Season season = seasonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("시즌을 찾을 수 없습니다."));
        return SeasonResponseDto.from(season);
    }

    // 시즌 수정
    @Transactional
    public SeasonResponseDto update(Long id, SeasonRequestDto request) {
        Season season = seasonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("시즌을 찾을 수 없습니다."));
        season.update(request.getName(), request.getType(), request.getYear(),
                request.getStartDate(), request.getEndDate(), request.getStatus());
        return SeasonResponseDto.from(season);
    }

    // 시즌 삭제
    @Transactional
    public void delete(Long id) {
        if (!seasonRepository.existsById(id)) {
            throw new RuntimeException("시즌을 찾을 수 없습니다.");
        }
        seasonRepository.deleteById(id);
    }
}