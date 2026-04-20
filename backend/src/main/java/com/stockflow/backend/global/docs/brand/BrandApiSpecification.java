package com.stockflow.backend.global.docs.brand;

import com.stockflow.backend.domain.brand.dto.BrandRequestDto;
import com.stockflow.backend.domain.brand.dto.BrandResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "브랜드", description = "브랜드 관리 API")
public interface BrandApiSpecification {

    @Operation(summary = "브랜드 생성", description = "💡 새로운 브랜드를 등록합니다.")
    @PostMapping
    ResponseEntity<BrandResponseDto> createBrand(@RequestBody @Valid BrandRequestDto request);

    @Operation(summary = "브랜드 전체 조회", description = "💡 전체 브랜드 목록을 조회합니다.")
    @GetMapping
    ResponseEntity<List<BrandResponseDto>> getBrands();

    @Operation(summary = "브랜드 단건 조회", description = "💡 ID로 브랜드를 조회합니다.")
    @GetMapping("/{id}")
    ResponseEntity<BrandResponseDto> getBrand(@PathVariable Long id);

    @Operation(summary = "브랜드 수정", description = "💡 브랜드 정보를 수정합니다.")
    @PutMapping("/{id}")
    ResponseEntity<BrandResponseDto> updateBrand(@PathVariable Long id, @RequestBody @Valid BrandRequestDto request);

    @Operation(summary = "브랜드 삭제", description = "💡 브랜드를 삭제합니다.")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteBrand(@PathVariable Long id);
}