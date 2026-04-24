package com.stockflow.backend.domain.store.service;

import com.stockflow.backend.domain.store.dto.StoreRequestDto;
import com.stockflow.backend.domain.store.dto.StoreResponseDto;
import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.store.entity.StoreType;
import com.stockflow.backend.domain.store.repository.StoreRepository;
import com.stockflow.backend.global.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class StoreServiceTest {

    @Mock StoreRepository storeRepository;

    @InjectMocks
    StoreService storeService;

    @Test
    @DisplayName("매장 생성 성공")
    void create_success() {
        // given
        StoreRequestDto request = new StoreRequestDto("신세계 천안아산점", "충남 아산시", StoreType.DEPARTMENT, "041-000-0000");
        Store store = Store.builder()
                .id(1L)
                .name("신세계 천안아산점")
                .location("충남 아산시")
                .storeType(StoreType.DEPARTMENT)
                .phone("041-000-0000")
                .build();
        given(storeRepository.save(any())).willReturn(store);

        // when
        StoreResponseDto result = storeService.create(request);

        // then
        assertThat(result.getName()).isEqualTo("신세계 천안아산점");
    }

    @Test
    @DisplayName("매장 단건 조회 성공")
    void findById_success() {
        // given
        Store store = Store.builder()
                .id(1L)
                .name("신세계 천안아산점")
                .location("충남 아산시")
                .storeType(StoreType.DEPARTMENT)
                .build();
        given(storeRepository.findById(1L)).willReturn(Optional.of(store));

        // when
        StoreResponseDto result = storeService.findById(1L);

        // then
        assertThat(result.getName()).isEqualTo("신세계 천안아산점");
    }

    @Test
    @DisplayName("매장 단건 조회 실패 - 없는 매장")
    void findById_fail_notFound() {
        // given
        given(storeRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> storeService.findById(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("매장 삭제 성공")
    void delete_success() {
        // given
        given(storeRepository.existsById(1L)).willReturn(true);

        // when
        storeService.delete(1L);

        // then
        verify(storeRepository).deleteById(1L);
    }

    @Test
    @DisplayName("매장 삭제 실패 - 없는 매장")
    void delete_fail_notFound() {
        // given
        given(storeRepository.existsById(1L)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> storeService.delete(1L))
                .isInstanceOf(BusinessException.class);
    }
}