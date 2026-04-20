package com.stockflow.backend.domain.brand.controller;

import com.stockflow.backend.domain.brand.dto.BrandRequestDto;
import com.stockflow.backend.domain.brand.dto.BrandResponseDto;
import com.stockflow.backend.domain.brand.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @PostMapping
    public ResponseEntity<BrandResponseDto> createBrand(
            @RequestBody @Valid BrandRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(brandService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<BrandResponseDto>> getBrands() {
        return ResponseEntity.ok(brandService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandResponseDto> getBrand(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandResponseDto> updateBrand(
            @PathVariable Long id,
            @RequestBody @Valid BrandRequestDto request) {
        return ResponseEntity.ok(brandService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.noContent().build();
    }
}