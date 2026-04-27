package com.stockflow.backend.global.config;

import com.stockflow.backend.global.jwt.JwtAuthenticationFilter;
import com.stockflow.backend.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.addAllowedOriginPattern("*");
                    config.addAllowedMethod("*");
                    config.addAllowedHeader("*");
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // 인증 없이 접근 가능
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/docs", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()

                        // 배분 조회 → 모든 인증된 사용자
                        .requestMatchers(HttpMethod.GET, "/api/allocations/**").authenticated()
                        // 배분 생성 → 본사만
                        .requestMatchers(HttpMethod.POST, "/api/allocations/**").hasRole("HQ_STAFF")
                        // 배분 승인/반려 → 본사만
                        .requestMatchers(HttpMethod.PATCH, "/api/allocations/*/approve").hasRole("HQ_STAFF")
                        .requestMatchers(HttpMethod.PATCH, "/api/allocations/*/cancel").hasRole("HQ_STAFF")
                        // 배분 출고 → 창고 담당자 + 본사
                        .requestMatchers(HttpMethod.PATCH, "/api/allocations/*/ship").hasAnyRole("HQ_STAFF", "WAREHOUSE_STAFF")
                        // 배분 입고완료 → 매장 관리자 + 본사
                        .requestMatchers(HttpMethod.PATCH, "/api/allocations/*/receive").hasAnyRole("HQ_STAFF", "STORE_MANAGER")

                        // 창고 재고 → 본사 + 창고담당자
                        .requestMatchers(HttpMethod.GET, "/api/warehouses/*/stocks/**").hasAnyRole("HQ_STAFF", "WAREHOUSE_STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/warehouses/*/stocks/**").hasAnyRole("HQ_STAFF", "WAREHOUSE_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/warehouses/*/stocks/**").hasAnyRole("HQ_STAFF", "WAREHOUSE_STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/warehouses/*/stocks/**").hasAnyRole("HQ_STAFF", "WAREHOUSE_STAFF")
                        // 창고 목록/상세 조회 → 본사 + 창고담당자
                        .requestMatchers(HttpMethod.GET, "/api/warehouses").hasAnyRole("HQ_STAFF", "WAREHOUSE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/warehouses/**").hasAnyRole("HQ_STAFF", "WAREHOUSE_STAFF")
                        // 창고 생성/수정/삭제 → 본사만
                        .requestMatchers(HttpMethod.POST, "/api/warehouses").hasRole("HQ_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/warehouses/**").hasRole("HQ_STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/warehouses/**").hasRole("HQ_STAFF")

                        // 발주 승인/반려 → 본사만
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/approve").hasRole("HQ_STAFF")
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/reject").hasRole("HQ_STAFF")
                        // 발주 출고 → 본사 또는 창고 담당자
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/ship").hasAnyRole("HQ_STAFF", "WAREHOUSE_STAFF")
                        // 발주 입고완료 → 매장 관리자 + 본사
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/receive").hasAnyRole("HQ_STAFF", "STORE_MANAGER")

                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}