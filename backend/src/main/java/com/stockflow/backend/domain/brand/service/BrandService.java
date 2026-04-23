package com.stockflow.backend.domain.brand.service;

import com.stockflow.backend.domain.brand.dto.BrandRequestDto;
import com.stockflow.backend.domain.brand.dto.BrandResponseDto;
import com.stockflow.backend.domain.brand.entity.Brand;
import com.stockflow.backend.domain.brand.repository.BrandRepository;
import com.stockflow.backend.global.exception.BusinessException;
import com.stockflow.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandService {

    private final BrandRepository brandRepository;

    // 브랜드 생성
    @Transactional
    public BrandResponseDto create(BrandRequestDto request) {
        Brand brand = Brand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return BrandResponseDto.from(brandRepository.save(brand));
    }

    // 전체 조회
    public List<BrandResponseDto> findAll() {
        return brandRepository.findAll().stream()
                .map(BrandResponseDto::from)
                .collect(Collectors.toList());
    }

    // 단건 조회
    public BrandResponseDto findById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRAND_NOT_FOUND));
        return BrandResponseDto.from(brand);
    }

    // 수정
    @Transactional
    public BrandResponseDto update(Long id, BrandRequestDto request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRAND_NOT_FOUND));
        brand.update(request.getName(), request.getDescription());
        return BrandResponseDto.from(brand);
    }

    // 삭제
    @Transactional
    public void delete(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.BRAND_NOT_FOUND);
        }
        brandRepository.deleteById(id);
    }
}