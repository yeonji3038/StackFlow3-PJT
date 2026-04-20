package com.stockflow.backend.global.docs.category;

import com.stockflow.backend.domain.category.dto.CategoryRequestDto;
import com.stockflow.backend.domain.category.dto.CategoryResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "카테고리", description = "카테고리 관리 API")
public interface CategoryApiSpecification {

    @Operation(summary = "카테고리 생성", description = """
        💡 새로운 카테고리를 등록합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **name** : 카테고리명
        - **parentId** : 상위 카테고리 ID
            - 대분류 → **null** (입력 안 함)
            - 소분류 → **상위 카테고리 ID 입력**
        
        **[ 응답 필드 ]**
        - **id** : 카테고리 ID
        - **name** : 카테고리명
        - **children** : 하위 카테고리 목록
        """)
    @PostMapping
    ResponseEntity<CategoryResponseDto> createCategory(@RequestBody @Valid CategoryRequestDto request);

    @Operation(summary = "카테고리 전체 조회", description = """
        💡 전체 카테고리 목록을 계층 구조로 조회합니다.
        
        ---
        
        **[ 응답 필드 ]**
        - **id** : 카테고리 ID
        - **name** : 카테고리명
        - **children** : 하위 카테고리 목록
            - 대분류만 반환되며, 소분류는 children 안에 포함됩니다.
        """)
    @GetMapping
    ResponseEntity<List<CategoryResponseDto>> getCategories();

    @Operation(summary = "카테고리 단건 조회", description = """
        💡 ID로 카테고리를 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 조회할 카테고리 ID
        
        **[ 응답 필드 ]**
        - **id** : 카테고리 ID
        - **name** : 카테고리명
        - **children** : 하위 카테고리 목록
        """)
    @GetMapping("/{id}")
    ResponseEntity<CategoryResponseDto> getCategory(@PathVariable Long id);

    @Operation(summary = "카테고리 수정", description = """
        💡 카테고리 정보를 수정합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **name** : 카테고리명
        - **parentId** : 상위 카테고리 ID
            - 대분류 → **null** (입력 안 함)
            - 소분류 → **상위 카테고리 ID 입력**
        
        **[ 응답 필드 ]**
        - **id** : 카테고리 ID
        - **name** : 카테고리명
        - **children** : 하위 카테고리 목록
        """)
    @PutMapping("/{id}")
    ResponseEntity<CategoryResponseDto> updateCategory(@PathVariable Long id, @RequestBody @Valid CategoryRequestDto request);

    @Operation(summary = "카테고리 삭제", description = """
        💡 카테고리를 삭제합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 삭제할 카테고리 ID
        """)
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteCategory(@PathVariable Long id);
}