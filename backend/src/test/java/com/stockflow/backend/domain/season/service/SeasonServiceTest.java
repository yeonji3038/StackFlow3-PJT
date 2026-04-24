package com.stockflow.backend.domain.season.service;

import com.stockflow.backend.domain.season.dto.SeasonRequestDto;
import com.stockflow.backend.domain.season.dto.SeasonResponseDto;
import com.stockflow.backend.domain.season.entity.Season;
import com.stockflow.backend.domain.season.entity.SeasonStatus;
import com.stockflow.backend.domain.season.entity.SeasonType;
import com.stockflow.backend.domain.season.repository.SeasonRepository;
import com.stockflow.backend.global.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SeasonServiceTest {

    @Mock SeasonRepository seasonRepository;

    @InjectMocks
    SeasonService seasonService;

    @Test
    @DisplayName("시즌 생성 성공")
    void create_success() {
        // given
        SeasonRequestDto request = new SeasonRequestDto(
                "2026 SS", SeasonType.SS, 2026,
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 8, 31),
                SeasonStatus.PLANNING);

        Season season = Season.builder()
                .id(1L)
                .name("2026 SS")
                .type(SeasonType.SS)
                .year(2026)
                .status(SeasonStatus.PLANNING)
                .build();

        given(seasonRepository.save(any())).willReturn(season);

        // when
        SeasonResponseDto result = seasonService.create(request);

        // then
        assertThat(result.getName()).isEqualTo("2026 SS");
    }

    @Test
    @DisplayName("시즌 단건 조회 성공")
    void findById_success() {
        // given
        Season season = Season.builder()
                .id(1L)
                .name("2026 SS")
                .type(SeasonType.SS)
                .year(2026)
                .status(SeasonStatus.PLANNING)
                .build();

        given(seasonRepository.findById(1L)).willReturn(Optional.of(season));

        // when
        SeasonResponseDto result = seasonService.findById(1L);

        // then
        assertThat(result.getName()).isEqualTo("2026 SS");
    }

    @Test
    @DisplayName("시즌 단건 조회 실패 - 없는 시즌")
    void findById_fail_notFound() {
        // given
        given(seasonRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> seasonService.findById(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("시즌 삭제 성공")
    void delete_success() {
        // given
        given(seasonRepository.existsById(1L)).willReturn(true);

        // when
        seasonService.delete(1L);

        // then
        verify(seasonRepository).deleteById(1L);
    }

    @Test
    @DisplayName("시즌 삭제 실패 - 없는 시즌")
    void delete_fail_notFound() {
        // given
        given(seasonRepository.existsById(1L)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> seasonService.delete(1L))
                .isInstanceOf(BusinessException.class);
    }
}