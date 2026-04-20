package com.stockflow.backend.domain.season.controller;

import com.stockflow.backend.domain.season.dto.SeasonRequestDto;
import com.stockflow.backend.domain.season.dto.SeasonResponseDto;
import com.stockflow.backend.domain.season.service.SeasonService;
import com.stockflow.backend.global.docs.season.SeasonApiSpecification;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seasons")
@RequiredArgsConstructor
public class SeasonController implements SeasonApiSpecification {

    private final SeasonService seasonService;

    // 시즌 생성
    @PostMapping
    public ResponseEntity<SeasonResponseDto> createSeason(
            @RequestBody @Valid SeasonRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(seasonService.create(request));
    }

    // 시즌 전체 조회
    @GetMapping
    public ResponseEntity<List<SeasonResponseDto>> getSeasons() {
        return ResponseEntity.ok(seasonService.findAll());
    }

    // 시즌 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<SeasonResponseDto> getSeason(@PathVariable Long id) {
        return ResponseEntity.ok(seasonService.findById(id));
    }

    // 시즌 수정
    @PutMapping("/{id}")
    public ResponseEntity<SeasonResponseDto> updateSeason(
            @PathVariable Long id,
            @RequestBody @Valid SeasonRequestDto request) {
        return ResponseEntity.ok(seasonService.update(id, request));
    }

    // 시즌 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeason(@PathVariable Long id) {
        seasonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}