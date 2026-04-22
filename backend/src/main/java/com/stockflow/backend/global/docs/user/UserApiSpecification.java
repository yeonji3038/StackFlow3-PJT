package com.stockflow.backend.global.docs.user;

import com.stockflow.backend.domain.user.dto.UserRequestDto;
import com.stockflow.backend.domain.user.dto.UserResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "사용자", description = "사용자 관리 API")
public interface UserApiSpecification {


    @Operation(summary = "사용자 전체 조회", description = """
        💡 전체 사용자 목록을 조회합니다.
        
        ---
        
        **[ 응답 필드 ]**
        - **id** : 사용자 ID
        - **email** : 이메일
        - **name** : 이름
        - **role** : 역할
        - **storeId** : 소속 매장 ID
        - **storeName** : 소속 매장명
        - **createdAt** : 가입일시
        """)
    @GetMapping
    ResponseEntity<List<UserResponseDto>> getUsers();

    @Operation(summary = "사용자 단건 조회", description = """
        💡 ID로 사용자를 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 조회할 사용자 ID
        
        **[ 응답 필드 ]**
        - **id** : 사용자 ID
        - **email** : 이메일
        - **name** : 이름
        - **role** : 역할
        - **storeId** : 소속 매장 ID
        - **storeName** : 소속 매장명
        - **createdAt** : 가입일시
        """)
    @GetMapping("/{id}")
    ResponseEntity<UserResponseDto> getUser(@PathVariable Long id);

    @Operation(summary = "사용자 수정", description = """
        💡 사용자 정보를 수정합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 수정할 사용자 ID
        - **name** : 이름
        - **role** : 역할
            - 본사 직원 → **HQ_STAFF**
            - 매장 관리자 → **STORE_MANAGER**
            - 창고 담당자 → **WAREHOUSE_STAFF**
            - 직원 → **STAFF**
        - **storeId** : 소속 매장 ID
        
        **[ 응답 필드 ]**
        - **id** : 사용자 ID
        - **email** : 이메일
        - **name** : 이름
        - **role** : 역할
        - **storeId** : 소속 매장 ID
        - **storeName** : 소속 매장명
        - **createdAt** : 가입일시
        """)
    @PutMapping("/{id}")
    ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @RequestBody @Valid UserRequestDto request);

    @Operation(summary = "사용자 삭제", description = """
        💡 사용자를 삭제합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 삭제할 사용자 ID
        """)
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteUser(@PathVariable Long id);
}