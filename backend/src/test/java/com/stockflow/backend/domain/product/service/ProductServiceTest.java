package com.stockflow.backend.domain.product.service;

import com.stockflow.backend.domain.brand.entity.Brand;
import com.stockflow.backend.domain.brand.repository.BrandRepository;
import com.stockflow.backend.domain.category.entity.Category;
import com.stockflow.backend.domain.category.repository.CategoryRepository;
import com.stockflow.backend.domain.product.dto.ProductRequestDto;
import com.stockflow.backend.domain.product.dto.ProductResponseDto;
import com.stockflow.backend.domain.product.entity.Product;
import com.stockflow.backend.domain.product.entity.ProductStatus;
import com.stockflow.backend.domain.product.repository.ProductRepository;
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

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock ProductRepository productRepository;
    @Mock BrandRepository brandRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock SeasonRepository seasonRepository;

    @InjectMocks
    ProductService productService;

    @Test
    @DisplayName("상품 생성 성공")
    void create_success() {
        // given
        ProductRequestDto request = new ProductRequestDto(
                "오버핏 반팔 티셔츠", 1L, 1L, 1L,
                29000, 15000, "편안한 오버핏", ProductStatus.ON_SALE);

        Brand brand = Brand.builder().id(1L).name("나이키").build();
        Category category = Category.builder().id(1L).name("상의").build();
        Season season = Season.builder().id(1L).name("2026 SS").build();

        Product product = Product.builder()
                .id(1L)
                .name("오버핏 반팔 티셔츠")
                .brand(brand)
                .category(category)
                .season(season)
                .price(29000)
                .cost(15000)
                .status(ProductStatus.ON_SALE)
                .build();

        given(brandRepository.findById(1L)).willReturn(Optional.of(brand));
        given(categoryRepository.findById(1L)).willReturn(Optional.of(category));
        given(seasonRepository.findById(1L)).willReturn(Optional.of(season));
        given(productRepository.save(any())).willReturn(product);

        // when
        ProductResponseDto result = productService.create(request);

        // then
        assertThat(result.getName()).isEqualTo("오버핏 반팔 티셔츠");
    }

    @Test
    @DisplayName("상품 생성 실패 - 없는 브랜드")
    void create_fail_brandNotFound() {
        // given
        ProductRequestDto request = new ProductRequestDto(
                "오버핏 반팔 티셔츠", 999L, 1L, 1L,
                29000, 15000, "편안한 오버핏", ProductStatus.ON_SALE);

        given(brandRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("상품 단건 조회 성공")
    void findById_success() {
        // given
        Brand brand = Brand.builder().id(1L).name("나이키").build();
        Category category = Category.builder().id(1L).name("상의").build();
        Season season = Season.builder().id(1L).name("2026 SS").build();

        Product product = Product.builder()
                .id(1L)
                .name("오버핏 반팔 티셔츠")
                .brand(brand)
                .category(category)
                .season(season)
                .price(29000)
                .cost(15000)
                .status(ProductStatus.ON_SALE)
                .build();

        given(productRepository.findById(1L)).willReturn(Optional.of(product));

        // when
        ProductResponseDto result = productService.findById(1L);

        // then
        assertThat(result.getName()).isEqualTo("오버핏 반팔 티셔츠");
    }

    @Test
    @DisplayName("상품 단건 조회 실패 - 없는 상품")
    void findById_fail_notFound() {
        // given
        given(productRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> productService.findById(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("상품 삭제 성공")
    void delete_success() {
        // given
        given(productRepository.existsById(1L)).willReturn(true);

        // when
        productService.delete(1L);

        // then
        verify(productRepository).deleteById(1L);
    }

    @Test
    @DisplayName("상품 삭제 실패 - 없는 상품")
    void delete_fail_notFound() {
        // given
        given(productRepository.existsById(1L)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> productService.delete(1L))
                .isInstanceOf(BusinessException.class);
    }
}