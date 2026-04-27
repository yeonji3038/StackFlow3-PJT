package com.stockflow.backend.domain.auth.dto;

import com.stockflow.backend.domain.user.entity.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponseDto {

    private String accessToken;
    private String refreshToken;
    private String email;
    private String name;
    private UserRole role;
    private Long storeId;
    private Long warehouseId;
}