package com.stockflow.backend.global.docs.auth;

import com.stockflow.backend.domain.auth.dto.LoginRequestDto;
import com.stockflow.backend.domain.auth.dto.LoginResponseDto;
import com.stockflow.backend.domain.auth.dto.TokenResponseDto;
import com.stockflow.backend.domain.user.dto.UserRequestDto;
import com.stockflow.backend.domain.user.dto.UserResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증", description = "인증 관리 API")
public interface AuthApiSpecification {

    @Operation(summary = "회원가입", description = """
        💡 새로운 사용자를 등록합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **email** : 이메일 (중복 불가)
        - **password** : 비밀번호
        - **name** : 이름
        - **role** : 역할
            - 본사 직원 → **HQ_STAFF**
            - 매장 관리자 → **STORE_MANAGER**
            - 창고 담당자 → **WAREHOUSE_STAFF**
            - 직원 → **STAFF**
        - **storeId** : 소속 매장 ID (본사 직원은 null)
        
        **[ 응답 필드 ]**
        - **id** : 사용자 ID
        - **email** : 이메일
        - **name** : 이름
        - **role** : 역할
        - **storeId** : 소속 매장 ID
        - **storeName** : 소속 매장명
        - **createdAt** : 가입일시
        """)
    @PostMapping("/signup")
    ResponseEntity<UserResponseDto> signup(@RequestBody @Valid UserRequestDto request);

    @Operation(summary = "로그인", description = """
        💡 이메일과 비밀번호로 로그인합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **email** : 이메일
        - **password** : 비밀번호
        
        **[ 응답 필드 ]**
        - **accessToken** : 액세스 토큰 (1시간)
        - **refreshToken** : 리프레시 토큰 (7일)
        - **email** : 이메일
        - **name** : 이름
        - **role** : 역할
        """)
    @PostMapping("/login")
    ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto request);

    @Operation(summary = "토큰 재발급", description = """
        💡 리프레시 토큰으로 액세스 토큰을 재발급합니다.
        
        ---
        
        **[ 요청 헤더 ]**
        - **Refresh-Token** : 리프레시 토큰
        
        **[ 응답 필드 ]**
        - **accessToken** : 새로 발급된 액세스 토큰
        """)
    @PostMapping("/refresh")
    ResponseEntity<TokenResponseDto> refresh(@RequestHeader("Refresh-Token") String refreshToken);

    @Operation(summary = "로그아웃", description = """
        💡 로그아웃합니다. 리프레시 토큰이 삭제되어 토큰 재발급이 불가합니다.
        
        ---
        
        **[ 요청 헤더 ]**
        - **Authorization** : Bearer {액세스 토큰}
        """)
    @PostMapping("/logout")
    ResponseEntity<Void> logout(@RequestHeader("Authorization") String bearerToken);
}