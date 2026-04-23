package com.stockflow.backend.domain.auth.repository;

import com.stockflow.backend.domain.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // 이메일로 리프레시 토큰 조회
    Optional<RefreshToken> findByEmail(String email);

    // 이메일로 리프레시 토큰 삭제 (로그아웃 시)
    @Modifying
    @Transactional
    void deleteByEmail(String email);
}