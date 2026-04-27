package com.stockflow.backend.domain.auth.service;

import com.stockflow.backend.domain.auth.dto.LoginRequestDto;
import com.stockflow.backend.domain.auth.dto.LoginResponseDto;
import com.stockflow.backend.domain.auth.dto.TokenResponseDto;
import com.stockflow.backend.domain.auth.entity.RefreshToken;
import com.stockflow.backend.domain.auth.repository.RefreshTokenRepository;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.global.exception.BusinessException;
import com.stockflow.backend.global.exception.ErrorCode;
import com.stockflow.backend.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder passwordEncoder;

    // 로그인
    @Transactional
    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_PASSWORD));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        // 액세스 토큰 생성 (storeId, warehouseId 포함)
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getEmail(),
                user.getRole().name(),
                user.getStore() != null ? user.getStore().getId() : null,
                user.getWarehouse() != null ? user.getWarehouse().getId() : null
        );

        // 리프레시 토큰 생성
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // 기존 리프레시 토큰 삭제 후 새로 저장
        RefreshToken refreshTokenEntity = refreshTokenRepository
                .findByEmail(user.getEmail())
                .map(token -> {
                    token.updateToken(refreshToken);
                    return token;
                })
                .orElse(RefreshToken.builder()
                        .email(user.getEmail())
                        .token(refreshToken)
                        .build());

        refreshTokenRepository.save(refreshTokenEntity);

        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .storeId(user.getStore() != null ? user.getStore().getId() : null)
                .warehouseId(user.getWarehouse() != null ? user.getWarehouse().getId() : null)
                .build();
    }

    // 토큰 재발급
    @Transactional
    public TokenResponseDto refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        String email = jwtTokenProvider.getEmail(refreshToken);
        RefreshToken savedToken = refreshTokenRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        if (!savedToken.getToken().equals(refreshToken)) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_MISMATCH);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 새 액세스 토큰 발급 (storeId, warehouseId 포함)
        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getEmail(),
                user.getRole().name(),
                user.getStore() != null ? user.getStore().getId() : null,
                user.getWarehouse() != null ? user.getWarehouse().getId() : null
        );

        return TokenResponseDto.builder()
                .accessToken(newAccessToken)
                .build();
    }

    // 로그아웃
    @Transactional
    public void logout(String email) {
        refreshTokenRepository.deleteByEmail(email);
    }
}