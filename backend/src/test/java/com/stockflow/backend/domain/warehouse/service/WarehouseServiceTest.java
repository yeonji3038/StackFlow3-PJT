package com.stockflow.backend.domain.warehouse.service;

import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.entity.UserRole;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.domain.warehouse.dto.WarehouseRequestDto;
import com.stockflow.backend.domain.warehouse.dto.WarehouseResponseDto;
import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import com.stockflow.backend.domain.warehouse.repository.WarehouseRepository;
import com.stockflow.backend.global.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WarehouseServiceTest {

    @Mock WarehouseRepository warehouseRepository;
    @Mock UserRepository userRepository;

    @InjectMocks
    WarehouseService warehouseService;

    @Test
    @DisplayName("창고 생성 성공")
    void create_success() {
        // given
        WarehouseRequestDto request = new WarehouseRequestDto("서울 물류센터", "서울시 강남구", 2L);

        User manager = User.builder()
                .id(2L)
                .name("이영희")
                .role(UserRole.WAREHOUSE_STAFF)
                .build();

        Warehouse warehouse = Warehouse.builder()
                .id(1L)
                .name("서울 물류센터")
                .location("서울시 강남구")
                .manager(manager)
                .build();

        given(userRepository.findById(2L)).willReturn(Optional.of(manager));
        given(warehouseRepository.save(any())).willReturn(warehouse);

        // when
        WarehouseResponseDto result = warehouseService.create(request);

        // then
        assertThat(result.getName()).isEqualTo("서울 물류센터");
    }

    @Test
    @DisplayName("창고 생성 실패 - 없는 담당자")
    void create_fail_managerNotFound() {
        // given
        WarehouseRequestDto request = new WarehouseRequestDto("서울 물류센터", "서울시 강남구", 999L);
        given(userRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> warehouseService.create(request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("창고 단건 조회 성공")
    void findById_success() {
        // given
        User manager = User.builder().id(2L).name("이영희").build();
        Warehouse warehouse = Warehouse.builder()
                .id(1L)
                .name("서울 물류센터")
                .location("서울시 강남구")
                .manager(manager)
                .build();

        given(warehouseRepository.findById(1L)).willReturn(Optional.of(warehouse));

        // when
        WarehouseResponseDto result = warehouseService.findById(1L);

        // then
        assertThat(result.getName()).isEqualTo("서울 물류센터");
    }

    @Test
    @DisplayName("창고 단건 조회 실패 - 없는 창고")
    void findById_fail_notFound() {
        // given
        given(warehouseRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> warehouseService.findById(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("창고 삭제 성공")
    void delete_success() {
        // given
        given(warehouseRepository.existsById(1L)).willReturn(true);

        // when
        warehouseService.delete(1L);

        // then
        verify(warehouseRepository).deleteById(1L);
    }

    @Test
    @DisplayName("창고 삭제 실패 - 없는 창고")
    void delete_fail_notFound() {
        // given
        given(warehouseRepository.existsById(1L)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> warehouseService.delete(1L))
                .isInstanceOf(BusinessException.class);
    }
}
