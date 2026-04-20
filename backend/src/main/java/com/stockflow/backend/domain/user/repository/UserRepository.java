package com.stockflow.backend.domain.user.repository;

import com.stockflow.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 이메일로 사용자 조회 (로그인, 중복 확인 시 사용)
    Optional<User> findByEmail(String email);
}