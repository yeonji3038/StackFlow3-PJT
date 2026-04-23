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
                        // 본사 직원만 접근 가능
                        .requestMatchers("/api/allocations/**").hasRole("HQ_STAFF")
                        .requestMatchers("/api/warehouses/**").hasRole("HQ_STAFF")
                        // 창고 재고 조회는 로그인한 사람 모두 가능 (위에서 막혔으니 추가)
                        .requestMatchers(HttpMethod.GET, "/api/warehouses/*/stocks/**").authenticated()
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