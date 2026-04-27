package com.stockflow.backend.domain.auth.service;

import com.stockflow.backend.domain.auth.dto.LoginRequestDto;
import com.stockflow.backend.domain.auth.dto.LoginResponseDto;
import com.stockflow.backend.domain.auth.entity.RefreshToken;
import com.stockflow.backend.domain.auth.repository.RefreshTokenRepository;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.entity.UserRole;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.global.exception.BusinessException;
import com.stockflow.backend.global.jwt.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    AuthService authService;

    @Test
    @DisplayName("로그인 성공")
    void login_success() {
        // given
        LoginRequestDto request = new LoginRequestDto("hq@stockflow.com", "1234");

        User user = User.builder()
                .id(1L)
                .email("hq@stockflow.com")
                .password("encodedPassword")
                .name("김철수")
                .role(UserRole.HQ_STAFF)
                .build();

        given(userRepository.findByEmail("hq@stockflow.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("1234", "encodedPassword")).willReturn(true);
        given(jwtTokenProvider.generateAccessToken(any(), any())).willReturn("accessToken");
        given(jwtTokenProvider.generateRefreshToken(any())).willReturn("refreshToken");
        given(refreshTokenRepository.findByEmail(any())).willReturn(Optional.empty());
        given(refreshTokenRepository.save(any())).willReturn(null);

        // when
        LoginResponseDto result = authService.login(request);

        // then
        assertThat(result.getAccessToken()).isEqualTo("accessToken");
        assertThat(result.getEmail()).isEqualTo("hq@stockflow.com");
        assertThat(result.getName()).isEqualTo("김철수");
    }

    @Test
    @DisplayName("로그인 실패 - 이메일 없음")
    void login_fail_emailNotFound() {
        // given
        LoginRequestDto request = new LoginRequestDto("wrong@email.com", "1234");
        given(userRepository.findByEmail("wrong@email.com")).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치")
    void login_fail_wrongPassword() {
        // given
        LoginRequestDto request = new LoginRequestDto("hq@stockflow.com", "wrongPassword");

        User user = User.builder()
                .id(1L)
                .email("hq@stockflow.com")
                .password("encodedPassword")
                .name("김철수")
                .role(UserRole.HQ_STAFF)
                .build();

        given(userRepository.findByEmail("hq@stockflow.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("wrongPassword", "encodedPassword")).willReturn(false);

        // when & then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("로그아웃 성공")
    void logout_success() {
        // when
        authService.logout("hq@stockflow.com");

        // then
        verify(refreshTokenRepository).deleteByEmail("hq@stockflow.com");
    }
    @Test
    @DisplayName("토큰 재발급 성공")
    void refresh_success() {
        // given
        User user = User.builder()
                .id(1L)
                .email("hq@stockflow.com")
                .name("김철수")
                .role(UserRole.HQ_STAFF)
                .build();

        RefreshToken refreshToken = RefreshToken.builder()
                .email("hq@stockflow.com")
                .token("validRefreshToken")
                .build();

        given(jwtTokenProvider.validateToken("validRefreshToken")).willReturn(true);
        given(jwtTokenProvider.getEmail("validRefreshToken")).willReturn("hq@stockflow.com");
        given(refreshTokenRepository.findByEmail("hq@stockflow.com")).willReturn(Optional.of(refreshToken));
        given(userRepository.findByEmail("hq@stockflow.com")).willReturn(Optional.of(user));
        given(jwtTokenProvider.generateAccessToken(any(), any())).willReturn("newAccessToken");

        // when
        var result = authService.refresh("validRefreshToken");

        // then
        assertThat(result.getAccessToken()).isEqualTo("newAccessToken");
    }

    @Test
    @DisplayName("토큰 재발급 실패 - 유효하지 않은 토큰")
    void refresh_fail_invalidToken() {
        // given
        given(jwtTokenProvider.validateToken("invalidToken")).willReturn(false);

        // when & then
        assertThatThrownBy(() -> authService.refresh("invalidToken"))
                .isInstanceOf(BusinessException.class);
    }
}