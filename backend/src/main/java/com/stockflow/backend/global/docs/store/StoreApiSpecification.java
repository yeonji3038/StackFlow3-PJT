package com.stockflow.backend.global.docs.store;

import com.stockflow.backend.domain.store.dto.StoreRequestDto;
import com.stockflow.backend.domain.store.dto.StoreResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "매장", description = "매장 관리 API")
public interface StoreApiSpecification {

    @Operation(summary = "매장 생성", description = """
        💡 새로운 매장을 등록합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **name** : 매장명
        - **location** : 매장 위치
        - **storeType** : 매장 유형
            - 본사 → **HQ**
            - 백화점 → **DEPARTMENT**
            - 아울렛 → **OUTLET**
        - **phone** : 매장 전화번호
        
        **[ 응답 필드 ]**
        - **id** : 매장 ID
        - **name** : 매장명
        - **location** : 매장 위치
        - **storeType** : 매장 유형
        - **phone** : 매장 전화번호
        - **createdAt** : 생성일시
        """)
    @PostMapping
    ResponseEntity<StoreResponseDto> createStore(@RequestBody @Valid StoreRequestDto request);

    @Operation(summary = "매장 전체 조회", description = """
        💡 전체 매장 목록을 조회합니다.
        
        ---
        
        **[ 응답 필드 ]**
        - **id** : 매장 ID
        - **name** : 매장명
        - **location** : 매장 위치
        - **storeType** : 매장 유형
        - **phone** : 매장 전화번호
        - **createdAt** : 생성일시
        """)
    @GetMapping
    ResponseEntity<List<StoreResponseDto>> getStores();

    @Operation(summary = "매장 단건 조회", description = """
        💡 ID로 매장을 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 조회할 매장 ID
        
        **[ 응답 필드 ]**
        - **id** : 매장 ID
        - **name** : 매장명
        - **location** : 매장 위치
        - **storeType** : 매장 유형
        - **phone** : 매장 전화번호
        - **createdAt** : 생성일시
        """)
    @GetMapping("/{id}")
    ResponseEntity<StoreResponseDto> getStore(@PathVariable Long id);

    @Operation(summary = "매장 수정", description = """
        💡 매장 정보를 수정합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 수정할 매장 ID
        - **name** : 매장명
        - **location** : 매장 위치
        - **storeType** : 매장 유형
            - 본사 → **HQ**
            - 백화점 → **DEPARTMENT**
            - 아울렛 → **OUTLET**
        - **phone** : 매장 전화번호
        
        **[ 응답 필드 ]**
        - **id** : 매장 ID
        - **name** : 매장명
        - **location** : 매장 위치
        - **storeType** : 매장 유형
        - **phone** : 매장 전화번호
        - **createdAt** : 생성일시
        """)
    @PutMapping("/{id}")
    ResponseEntity<StoreResponseDto> updateStore(@PathVariable Long id, @RequestBody @Valid StoreRequestDto request);

    @Operation(summary = "매장 삭제", description = """
        💡 매장을 삭제합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 삭제할 매장 ID
        """)
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteStore(@PathVariable Long id);
}