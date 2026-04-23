package com.stockflow.backend.domain.auth.controller;

import com.stockflow.backend.domain.auth.dto.LoginRequestDto;
import com.stockflow.backend.domain.auth.dto.LoginResponseDto;
import com.stockflow.backend.domain.auth.dto.TokenResponseDto;
import com.stockflow.backend.domain.auth.service.AuthService;
import com.stockflow.backend.domain.user.dto.UserRequestDto;
import com.stockflow.backend.domain.user.dto.UserResponseDto;
import com.stockflow.backend.domain.user.service.UserService;
import com.stockflow.backend.global.docs.auth.AuthApiSpecification;
import com.stockflow.backend.global.jwt.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController implements AuthApiSpecification {

    private final UserService userService;
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<UserResponseDto> signup(
            @RequestBody @Valid UserRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(request));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody @Valid LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // 토큰 재발급
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refresh(
            @RequestHeader("Refresh-Token") String refreshToken) {
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String bearerToken) {
        String token = bearerToken.substring(7); // "Bearer " 제거 → 토큰값
        String email = jwtTokenProvider.getEmail(token); // 토큰에서 이메일 추출
        authService.logout(email);
        return ResponseEntity.noContent().build();
    }
}