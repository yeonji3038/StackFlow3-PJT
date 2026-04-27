package com.stockflow.backend.domain.allocation.service;

import com.stockflow.backend.domain.allocation.dto.AllocationRequestDto;
import com.stockflow.backend.domain.allocation.dto.AllocationResponseDto;
import com.stockflow.backend.domain.allocation.entity.Allocation;
import com.stockflow.backend.domain.allocation.entity.AllocationItem;
import com.stockflow.backend.domain.allocation.entity.AllocationStatus;
import com.stockflow.backend.domain.allocation.repository.AllocationItemRepository;
import com.stockflow.backend.domain.allocation.repository.AllocationRepository;
import com.stockflow.backend.domain.product.entity.ProductOption;
import com.stockflow.backend.domain.product.repository.ProductOptionRepository;
import com.stockflow.backend.domain.stockhistory.service.StockHistoryService;
import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.store.entity.StoreStock;
import com.stockflow.backend.domain.store.repository.StoreRepository;
import com.stockflow.backend.domain.store.repository.StoreStockRepository;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import com.stockflow.backend.domain.warehouse.entity.WarehouseStock;
import com.stockflow.backend.domain.warehouse.repository.WarehouseRepository;
import com.stockflow.backend.domain.warehouse.repository.WarehouseStockRepository;
import com.stockflow.backend.global.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.stockflow.backend.domain.product.entity.Product;
import com.stockflow.backend.domain.product.entity.ProductSize;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AllocationServiceTest {

    @Mock AllocationRepository allocationRepository;
    @Mock AllocationItemRepository allocationItemRepository;
    @Mock WarehouseRepository warehouseRepository;
    @Mock StoreRepository storeRepository;
    @Mock UserRepository userRepository;
    @Mock ProductOptionRepository productOptionRepository;
    @Mock WarehouseStockRepository warehouseStockRepository;
    @Mock StoreStockRepository storeStockRepository;
    @Mock StockHistoryService stockHistoryService;

    @InjectMocks
    AllocationService allocationService;
    @Test
    @DisplayName("배분 요청 성공")
    void create_success() {
        // given
        Warehouse warehouse = Warehouse.builder().id(1L).name("서울 물류센터").build();
        Store store = Store.builder().id(1L).name("신세계 천안아산점").build();
        User requestedBy = User.builder().id(1L).name("김철수").build();

        Product product = Product.builder()
                .id(1L)
                .name("오버핏 반팔 티셔츠")
                .build();

        ProductOption productOption = ProductOption.builder()
                .id(1L)
                .product(product)
                .color("블랙")
                .size(ProductSize.S)
                .skuCode("SKU-001-BK-S")
                .build();

        AllocationRequestDto.AllocationItemDto itemDto = new AllocationRequestDto.AllocationItemDto(1L, 5);
        AllocationRequestDto request = new AllocationRequestDto(1L, 1L, List.of(itemDto));

        Allocation allocation = Allocation.builder()
                .id(1L)
                .status(AllocationStatus.REQUESTED)
                .warehouse(warehouse)
                .store(store)
                .requestedBy(requestedBy)
                .build();

        AllocationItem item = AllocationItem.builder()
                .id(1L)
                .allocation(allocation)
                .productOption(productOption)
                .quantity(5)
                .build();

        given(warehouseRepository.findById(1L)).willReturn(Optional.of(warehouse));
        given(storeRepository.findById(1L)).willReturn(Optional.of(store));
        given(userRepository.findByEmail("hq@stockflow.com")).willReturn(Optional.of(requestedBy));
        given(productOptionRepository.findById(1L)).willReturn(Optional.of(productOption));
        given(allocationRepository.save(any())).willReturn(allocation);
        given(allocationItemRepository.save(any())).willReturn(item);
        given(allocationItemRepository.findByAllocationId(1L)).willReturn(List.of(item));

        // when
        AllocationResponseDto result = allocationService.create(request, "hq@stockflow.com");

        // then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getStatus()).isEqualTo(AllocationStatus.REQUESTED);
    }

    @Test
    @DisplayName("배분 전체 조회 성공")
    void findAll_success() {
        // given
        Warehouse warehouse = Warehouse.builder().id(1L).name("서울 물류센터").build();
        Store store = Store.builder().id(1L).name("신세계 천안아산점").build();
        User requestedBy = User.builder().id(1L).name("김철수").build();

        Allocation allocation = Allocation.builder()
                .id(1L)
                .status(AllocationStatus.REQUESTED)
                .warehouse(warehouse)
                .store(store)
                .requestedBy(requestedBy)
                .build();

        given(allocationRepository.findAll()).willReturn(List.of(allocation));
        given(allocationItemRepository.findByAllocationId(1L)).willReturn(List.of());

        // when
        var result = allocationService.findAll();

        // then
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("배분 단건 조회 성공")
    void findById_success() {
        // given
        Warehouse warehouse = Warehouse.builder().id(1L).name("서울 물류센터").build();
        Store store = Store.builder().id(1L).name("신세계 천안아산점").build();
        User requestedBy = User.builder().id(1L).name("김철수").build();

        Allocation allocation = Allocation.builder()
                .id(1L)
                .status(AllocationStatus.REQUESTED)
                .warehouse(warehouse)
                .store(store)
                .requestedBy(requestedBy)
                .build();

        given(allocationRepository.findById(1L)).willReturn(Optional.of(allocation));
        given(allocationItemRepository.findByAllocationId(1L)).willReturn(List.of());

        // when
        AllocationResponseDto result = allocationService.findById(1L);

        // then
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("배분 단건 조회 실패 - 없는 배분")
    void findById_fail_notFound() {
        // given
        given(allocationRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> allocationService.findById(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("배분 출고 성공")
    void ship_success() {
        // given
        Warehouse warehouse = Warehouse.builder().id(1L).build();
        Store store = Store.builder().id(1L).build();
        User approvedBy = User.builder().id(1L).build();

        Product product = Product.builder()
                .id(1L)
                .name("오버핏 반팔 티셔츠")
                .build();

        ProductOption productOption = ProductOption.builder()
                .id(1L)
                .product(product)
                .color("블랙")
                .size(ProductSize.S)
                .skuCode("SKU-001-BK-S")
                .build();

        Allocation allocation = Allocation.builder()
                .id(1L)
                .status(AllocationStatus.APPROVED)
                .warehouse(warehouse)
                .store(store)
                .approvedBy(approvedBy)
                .requestedBy(approvedBy)
                .build();

        AllocationItem item = AllocationItem.builder()
                .productOption(productOption)
                .quantity(5)
                .build();

        WarehouseStock warehouseStock = WarehouseStock.builder()
                .warehouse(warehouse)
                .productOption(productOption)
                .quantity(100)
                .build();

        given(allocationRepository.findById(1L)).willReturn(Optional.of(allocation));
        given(allocationItemRepository.findByAllocationId(1L)).willReturn(List.of(item));
        given(warehouseStockRepository.findByWarehouseIdAndProductOptionId(1L, 1L))
                .willReturn(Optional.of(warehouseStock));

        // when
        AllocationResponseDto result = allocationService.ship(1L);

        // then
        assertThat(allocation.getStatus()).isEqualTo(AllocationStatus.SHIPPED);
    }

    @Test
    @DisplayName("배분 입고완료 성공")
    void receive_success() {
        // given
        Warehouse warehouse = Warehouse.builder().id(1L).build();
        Store store = Store.builder().id(1L).build();
        User approvedBy = User.builder().id(1L).build();

        Product product = Product.builder()
                .id(1L)
                .name("오버핏 반팔 티셔츠")
                .build();

        ProductOption productOption = ProductOption.builder()
                .id(1L)
                .product(product)
                .color("블랙")
                .size(ProductSize.S)
                .skuCode("SKU-001-BK-S")
                .build();

        Allocation allocation = Allocation.builder()
                .id(1L)
                .status(AllocationStatus.SHIPPED)
                .warehouse(warehouse)
                .store(store)
                .approvedBy(approvedBy)
                .requestedBy(approvedBy)
                .build();

        AllocationItem item = AllocationItem.builder()
                .productOption(productOption)
                .quantity(5)
                .build();

        StoreStock storeStock = StoreStock.builder()
                .store(store)
                .productOption(productOption)
                .quantity(10)
                .build();

        given(allocationRepository.findById(1L)).willReturn(Optional.of(allocation));
        given(allocationItemRepository.findByAllocationId(1L)).willReturn(List.of(item));
        given(storeStockRepository.findByStoreIdAndProductOptionId(1L, 1L))
                .willReturn(Optional.of(storeStock));

        // when
        AllocationResponseDto result = allocationService.receive(1L);

        // then
        assertThat(allocation.getStatus()).isEqualTo(AllocationStatus.RECEIVED);
    }
    @Test
    @DisplayName("배분 취소 성공")
    void cancel_success() {
        // given
        Warehouse warehouse = Warehouse.builder().id(1L).name("서울 물류센터").build();
        Store store = Store.builder().id(1L).name("신세계 천안아산점").build();
        User requestedBy = User.builder().id(1L).name("김철수").build();

        Allocation allocation = Allocation.builder()
                .id(1L)
                .status(AllocationStatus.REQUESTED)
                .warehouse(warehouse)
                .store(store)
                .requestedBy(requestedBy)
                .build();

        given(allocationRepository.findById(1L)).willReturn(Optional.of(allocation));
        given(allocationItemRepository.findByAllocationId(1L)).willReturn(List.of());

        // when
        AllocationResponseDto result = allocationService.cancel(1L);

        // then
        assertThat(allocation.getStatus()).isEqualTo(AllocationStatus.CANCELLED);
    }

    @Test
    @DisplayName("배분 출고 실패 - APPROVED 상태가 아닌 경우")
    void ship_fail_invalidStatus() {
        // given
        Allocation allocation = Allocation.builder()
                .id(1L)
                .status(AllocationStatus.REQUESTED)
                .build();

        given(allocationRepository.findById(1L)).willReturn(Optional.of(allocation));

        // when & then
        assertThatThrownBy(() -> allocationService.ship(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("배분 입고완료 실패 - SHIPPED 상태가 아닌 경우")
    void receive_fail_invalidStatus() {
        // given
        Allocation allocation = Allocation.builder()
                .id(1L)
                .status(AllocationStatus.APPROVED)
                .build();

        given(allocationRepository.findById(1L)).willReturn(Optional.of(allocation));

        // when & then
        assertThatThrownBy(() -> allocationService.receive(1L))
                .isInstanceOf(BusinessException.class);
    }
}