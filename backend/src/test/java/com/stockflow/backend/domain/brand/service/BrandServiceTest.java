package com.stockflow.backend.domain.brand.service;

import com.stockflow.backend.domain.brand.dto.BrandRequestDto;
import com.stockflow.backend.domain.brand.dto.BrandResponseDto;
import com.stockflow.backend.domain.brand.entity.Brand;
import com.stockflow.backend.domain.brand.repository.BrandRepository;
import com.stockflow.backend.global.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class BrandServiceTest {

    @Mock BrandRepository brandRepository;

    @InjectMocks
    BrandService brandService;

    @Test
    @DisplayName("브랜드 생성 성공")
    void create_success() {
        // given
        BrandRequestDto request = new BrandRequestDto("나이키", "스포츠 브랜드");
        Brand brand = Brand.builder().id(1L).name("나이키").description("스포츠 브랜드").build();
        given(brandRepository.save(any())).willReturn(brand);

        // when
        BrandResponseDto result = brandService.create(request);

        // then
        assertThat(result.getName()).isEqualTo("나이키");
    }

    @Test
    @DisplayName("브랜드 단건 조회 성공")
    void findById_success() {
        // given
        Brand brand = Brand.builder().id(1L).name("나이키").description("스포츠 브랜드").build();
        given(brandRepository.findById(1L)).willReturn(Optional.of(brand));

        // when
        BrandResponseDto result = brandService.findById(1L);

        // then
        assertThat(result.getName()).isEqualTo("나이키");
    }

    @Test
    @DisplayName("브랜드 단건 조회 실패 - 없는 브랜드")
    void findById_fail_notFound() {
        // given
        given(brandRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> brandService.findById(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("브랜드 수정 성공")
    void update_success() {
        // given
        BrandRequestDto request = new BrandRequestDto("아디다스", "스포츠 브랜드2");
        Brand brand = Brand.builder().id(1L).name("나이키").description("스포츠 브랜드").build();
        given(brandRepository.findById(1L)).willReturn(Optional.of(brand));

        // when
        BrandResponseDto result = brandService.update(1L, request);

        // then
        assertThat(result.getName()).isEqualTo("아디다스");
    }

    @Test
    @DisplayName("브랜드 삭제 성공")
    void delete_success() {
        // given
        given(brandRepository.existsById(1L)).willReturn(true);

        // when
        brandService.delete(1L);

        // then
        verify(brandRepository).deleteById(1L);
    }

    @Test
    @DisplayName("브랜드 삭제 실패 - 없는 브랜드")
    void delete_fail_notFound() {
        // given
        given(brandRepository.existsById(1L)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> brandService.delete(1L))
                .isInstanceOf(BusinessException.class);
    }
}