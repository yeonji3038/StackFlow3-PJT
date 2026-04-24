package com.stockflow.backend.domain.product.service;

import com.stockflow.backend.domain.brand.entity.Brand;
import com.stockflow.backend.domain.brand.repository.BrandRepository;
import com.stockflow.backend.domain.category.entity.Category;
import com.stockflow.backend.domain.category.repository.CategoryRepository;
import com.stockflow.backend.domain.product.dto.ProductRequestDto;
import com.stockflow.backend.domain.product.dto.ProductResponseDto;
import com.stockflow.backend.domain.product.entity.Product;
import com.stockflow.backend.domain.product.repository.ProductRepository;
import com.stockflow.backend.domain.season.entity.Season;
import com.stockflow.backend.domain.season.repository.SeasonRepository;
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
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final SeasonRepository seasonRepository;

    // 상품 생성
    @Transactional
    public ProductResponseDto create(ProductRequestDto request) {
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BRAND_NOT_FOUND));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        Season season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SEASON_NOT_FOUND));

        Product product = Product.builder()
                .name(request.getName())
                .brand(brand)
                .category(category)
                .season(season)
                .price(request.getPrice())
                .cost(request.getCost())
                .description(request.getDescription())
                .status(request.getStatus())
                .build();

        return ProductResponseDto.from(productRepository.save(product));
    }

    // 상품 전체 조회
    public List<ProductResponseDto> findAll() {
        return productRepository.findAll().stream()
                .map(ProductResponseDto::from)
                .collect(Collectors.toList());
    }

    // 상품 단건 조회
    public ProductResponseDto findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        return ProductResponseDto.from(product);
    }

    // 상품 수정
    @Transactional
    public ProductResponseDto update(Long id, ProductRequestDto request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BRAND_NOT_FOUND));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        Season season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SEASON_NOT_FOUND));

        product.update(request.getName(), brand, category, season,
                request.getPrice(), request.getCost(), request.getDescription(), request.getStatus());

        return ProductResponseDto.from(product);
    }

    // 상품 삭제
    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        productRepository.deleteById(id);
    }
}