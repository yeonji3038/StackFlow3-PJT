package com.stockflow.backend.domain.category.service;

import com.stockflow.backend.domain.category.dto.CategoryRequestDto;
import com.stockflow.backend.domain.category.dto.CategoryResponseDto;
import com.stockflow.backend.domain.category.entity.Category;
import com.stockflow.backend.domain.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponseDto create(CategoryRequestDto request) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("상위 카테고리를 찾을 수 없습니다."));
        }

        Category category = Category.builder()
                .name(request.getName())
                .parent(parent)
                .build();

        return CategoryResponseDto.from(categoryRepository.save(category));
    }

    public List<CategoryResponseDto> findAll() {
        List<Category> all = categoryRepository.findAll();

        Map<Long, CategoryResponseDto> dtoMap = new LinkedHashMap<>();
        List<CategoryResponseDto> result = new ArrayList<>();

        // 대분류 먼저
        for (Category category : all) {
            if (category.getParent() == null) {
                CategoryResponseDto dto = CategoryResponseDto.from(category);
                dtoMap.put(category.getId(), dto);
                result.add(dto);
            }
        }

        // 소분류 부모에 추가
        for (Category category : all) {
            if (category.getParent() != null) {
                CategoryResponseDto parentDto = dtoMap.get(category.getParent().getId());
                if (parentDto != null) {
                    parentDto.getChildren().add(CategoryResponseDto.from(category));
                }
            }
        }

        return result;
    }

    public CategoryResponseDto findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
        return CategoryResponseDto.from(category);
    }

    @Transactional
    public CategoryResponseDto update(Long id, CategoryRequestDto request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("상위 카테고리를 찾을 수 없습니다."));
        }

        category.update(request.getName(), parent);
        return CategoryResponseDto.from(category);
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("카테고리를 찾을 수 없습니다.");
        }
        categoryRepository.deleteById(id);
    }
}