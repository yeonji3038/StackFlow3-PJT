package com.stockflow.backend.domain.user.dto;

import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.entity.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponseDto {

    private Long id;
    private String email;
    private String name;
    private UserRole role;
    private Long storeId;
    private String storeName;
    private LocalDateTime createdAt;

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .storeId(user.getStore() != null ? user.getStore().getId() : null)
                .storeName(user.getStore() != null ? user.getStore().getName() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}