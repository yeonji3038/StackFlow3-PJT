package com.stockflow.backend.domain.user.service;

import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.store.repository.StoreRepository;
import com.stockflow.backend.domain.user.dto.UserRequestDto;
import com.stockflow.backend.domain.user.dto.UserResponseDto;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.entity.UserRole;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.global.exception.BusinessException;
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
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock StoreRepository storeRepository;
    @Mock BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    UserService userService;

    @Test
    @DisplayName("회원가입 성공")
    void create_success() {
        // given
        UserRequestDto request = new UserRequestDto(
                "test@stockflow.com", "1234", "홍길동", UserRole.HQ_STAFF, null);

        User user = User.builder()
                .id(1L)
                .email("test@stockflow.com")
                .name("홍길동")
                .role(UserRole.HQ_STAFF)
                .build();

        given(userRepository.findByEmail("test@stockflow.com")).willReturn(Optional.empty());
        given(passwordEncoder.encode(any())).willReturn("encodedPassword");
        given(userRepository.save(any())).willReturn(user);

        // when
        UserResponseDto result = userService.create(request);

        // then
        assertThat(result.getEmail()).isEqualTo("test@stockflow.com");
        assertThat(result.getName()).isEqualTo("홍길동");
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복")
    void create_fail_duplicateEmail() {
        // given
        UserRequestDto request = new UserRequestDto(
                "hq@stockflow.com", "1234", "홍길동", UserRole.HQ_STAFF, null);

        User existingUser = User.builder()
                .id(1L)
                .email("hq@stockflow.com")
                .build();

        given(userRepository.findByEmail("hq@stockflow.com")).willReturn(Optional.of(existingUser));

        // when & then
        assertThatThrownBy(() -> userService.create(request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("사용자 단건 조회 성공")
    void findById_success() {
        // given
        User user = User.builder()
                .id(1L)
                .email("hq@stockflow.com")
                .name("김철수")
                .role(UserRole.HQ_STAFF)
                .build();

        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        // when
        UserResponseDto result = userService.findById(1L);

        // then
        assertThat(result.getName()).isEqualTo("김철수");
    }

    @Test
    @DisplayName("사용자 단건 조회 실패 - 없는 사용자")
    void findById_fail_notFound() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.findById(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("사용자 삭제 성공")
    void delete_success() {
        // given
        given(userRepository.existsById(1L)).willReturn(true);

        // when
        userService.delete(1L);

        // then
        verify(userRepository).deleteById(1L);
    }

    @Test
    @DisplayName("사용자 삭제 실패 - 없는 사용자")
    void delete_fail_notFound() {
        // given
        given(userRepository.existsById(1L)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> userService.delete(1L))
                .isInstanceOf(BusinessException.class);
    }
}