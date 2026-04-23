package com.stockflow.backend.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Stockflow API")
                        .description("재고 관리 시스템 API 문서")
                        .version("v1.0.0"))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }

    @Bean
    public GroupedOpenApi commonApi() {
        return GroupedOpenApi.builder()
                .group("공통데이터")
                .pathsToMatch("/api/brands/**", "/api/categories/**", "/api/seasons/**", "/api/stores/**")
                .build();
    }

    @Bean
    public GroupedOpenApi productApi() {
        return GroupedOpenApi.builder()
                .group("상품")
                .pathsToMatch("/api/products/**")
                .build();
    }

    @Bean
    public GroupedOpenApi stockApi() {
        return GroupedOpenApi.builder()
                .group("재고")
                .pathsToMatch("/api/warehouses/*/stocks/**", "/api/stores/*/stocks/**")
                .build();
    }

    @Bean
    public GroupedOpenApi headquartersApi() {
        return GroupedOpenApi.builder()
                .group("본사업무")
                .pathsToMatch("/api/warehouses/**", "/api/allocations/**")
                .build();
    }
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("사용자인증")
                .pathsToMatch("/api/users/**", "/api/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi storeApi() {
        return GroupedOpenApi.builder()
                .group("매장 업무")
                .pathsToMatch("/api/orders/**")
                .build();
    }
//
//    @Bean
//    public GroupedOpenApi historyApi() {
//        return GroupedOpenApi.builder()
//                .group("6. 이력")
//                .pathsToMatch("/api/stock-history/**")
//                .build();
//    }
//

}