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
                .orElseThrow(() -> new RuntimeException("브랜드를 찾을 수 없습니다."));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
        Season season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new RuntimeException("시즌을 찾을 수 없습니다."));

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
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));
        return ProductResponseDto.from(product);
    }

    // 상품 수정
    @Transactional
    public ProductResponseDto update(Long id, ProductRequestDto request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("브랜드를 찾을 수 없습니다."));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
        Season season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new RuntimeException("시즌을 찾을 수 없습니다."));

        product.update(request.getName(), brand, category, season,
                request.getPrice(), request.getCost(), request.getDescription(), request.getStatus());

        return ProductResponseDto.from(product);
    }

    // 상품 삭제
    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("상품을 찾을 수 없습니다.");
        }
        productRepository.deleteById(id);
    }
}