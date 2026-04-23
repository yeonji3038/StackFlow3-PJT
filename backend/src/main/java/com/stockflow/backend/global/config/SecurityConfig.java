package com.stockflow.backend.global.config;

import com.stockflow.backend.global.jwt.JwtAuthenticationFilter;
import com.stockflow.backend.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 인증 없이 접근 가능
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/docs", "/v3/api-docs/**", "/swagger-ui/**").permitAll()

                        // 창고 재고 조회는 인증된 사람 모두 가능
                        .requestMatchers(HttpMethod.GET, "/api/warehouses/*/stocks/**").authenticated()

                        // 본사 직원만 접근 가능
                        .requestMatchers("/api/allocations/**").hasRole("HQ_STAFF")
                        .requestMatchers("/api/warehouses/**").hasRole("HQ_STAFF")

                        // 발주 승인/반려 → 본사만
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/approve").hasRole("HQ_STAFF")
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/reject").hasRole("HQ_STAFF")

                        // 발주 출고 → 본사 또는 창고 담당자
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/ship").hasAnyRole("HQ_STAFF", "WAREHOUSE_STAFF")

                        // 발주 입고완료 → 매장 관리자
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/receive").hasAnyRole("HQ_STAFF", "STORE_MANAGER")

                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )

                // JWT 필터
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // 비밀번호 암호화 Bean 등록
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}