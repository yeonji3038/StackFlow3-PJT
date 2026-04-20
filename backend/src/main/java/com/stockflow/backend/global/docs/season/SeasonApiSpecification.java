package com.stockflow.backend.global.docs.season;

import com.stockflow.backend.domain.season.dto.SeasonRequestDto;
import com.stockflow.backend.domain.season.dto.SeasonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "시즌", description = "시즌 관리 API")
public interface SeasonApiSpecification {

    @Operation(summary = "시즌 생성", description = """
    💡 새로운 시즌을 등록합니다.
    
    ---
    
    **[ 요청 값 ]**
    - **name** : 시즌명
    - **type** : 시즌 유형
        - 봄여름 → **SS**
        - 가을겨울 → **FW**
    - **year** : 연도
    - **startDate** : 시즌 시작일
    - **endDate** : 시즌 종료일
    - **status** : 시즌 상태
        - 기획중 → **PLANNING**
        - 진행중 → **IN_PROGRESS**
        - 종료 → **ENDED**
    
    **[ 응답 필드 ]**
    - **id** : 시즌 ID
    - **name** : 시즌명
    - **type** : 시즌 유형
    - **year** : 연도
    - **startDate** : 시즌 시작일
    - **endDate** : 시즌 종료일
    - **status** : 시즌 상태
    """)
    @PostMapping
    ResponseEntity<SeasonResponseDto> createSeason(@RequestBody @Valid SeasonRequestDto request);

    @Operation(summary = "시즌 전체 조회", description = "💡 전체 시즌 목록을 조회합니다.")
    @GetMapping
    ResponseEntity<List<SeasonResponseDto>> getSeasons();

    @Operation(summary = "시즌 단건 조회", description = "💡 ID로 시즌을 조회합니다.")
    @GetMapping("/{id}")
    ResponseEntity<SeasonResponseDto> getSeason(@PathVariable Long id);

    @Operation(summary = "시즌 수정", description = "💡 시즌 정보를 수정합니다.")
    @PutMapping("/{id}")
    ResponseEntity<SeasonResponseDto> updateSeason(@PathVariable Long id, @RequestBody @Valid SeasonRequestDto request);

    @Operation(summary = "시즌 삭제", description = "💡 시즌을 삭제합니다.")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteSeason(@PathVariable Long id);
}