package com.stockflow.backend.domain.order.service;

import com.stockflow.backend.domain.order.dto.OrderResponseDto;
import com.stockflow.backend.domain.order.entity.Order;
import com.stockflow.backend.domain.order.entity.OrderItem;
import com.stockflow.backend.domain.order.entity.OrderStatus;
import com.stockflow.backend.domain.order.repository.OrderItemRepository;
import com.stockflow.backend.domain.order.repository.OrderRepository;
import com.stockflow.backend.domain.product.entity.ProductOption;
import com.stockflow.backend.domain.product.repository.ProductOptionRepository;
import com.stockflow.backend.domain.stockhistory.service.StockHistoryService;
import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.store.repository.StoreRepository;
import com.stockflow.backend.domain.store.repository.StoreStockRepository;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.domain.warehouse.entity.WarehouseStock;
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
import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import com.stockflow.backend.domain.warehouse.entity.WarehouseStock;
import com.stockflow.backend.domain.store.entity.StoreStock;
import com.stockflow.backend.domain.order.dto.OrderRequestDto;
import com.stockflow.backend.domain.product.entity.Product;
import com.stockflow.backend.domain.product.entity.ProductSize;
import com.stockflow.backend.domain.order.entity.OrderItem;
import static org.mockito.ArgumentMatchers.any;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock OrderItemRepository orderItemRepository;
    @Mock StoreRepository storeRepository;
    @Mock UserRepository userRepository;
    @Mock ProductOptionRepository productOptionRepository;
    @Mock WarehouseStockRepository warehouseStockRepository;
    @Mock StoreStockRepository storeStockRepository;
    @Mock StockHistoryService stockHistoryService;

    @InjectMocks
    OrderService orderService;
    @Test
    @DisplayName("발주 요청 성공")
    void create_success() {
        // given
        Store store = Store.builder().id(1L).name("신세계 천안아산점").build();
        User requestedBy = User.builder().id(1L).name("박지수").build();

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

        OrderRequestDto.OrderItemDto itemDto = new OrderRequestDto.OrderItemDto(1L, 5);
        OrderRequestDto request = new OrderRequestDto(1L, null, List.of(itemDto));

        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.REQUESTED)
                .store(store)
                .requestedBy(requestedBy)
                .build();

        OrderItem item = OrderItem.builder()
                .id(1L)
                .order(order)
                .productOption(productOption)
                .quantity(5)
                .build();

        given(storeRepository.findById(1L)).willReturn(Optional.of(store));
        given(userRepository.findByEmail("store@stockflow.com")).willReturn(Optional.of(requestedBy));
        given(productOptionRepository.findById(1L)).willReturn(Optional.of(productOption));
        given(orderRepository.save(any())).willReturn(order);
        given(orderItemRepository.save(any())).willReturn(item);
        given(orderItemRepository.findByOrderId(1L)).willReturn(List.of(item));

        // when
        OrderResponseDto result = orderService.create(request, "store@stockflow.com");

        // then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getStatus()).isEqualTo(OrderStatus.REQUESTED);
    }

    @Test
    @DisplayName("발주 전체 조회 성공")
    void findAll_success() {
        // given
        Store store = Store.builder().id(1L).name("신세계 천안아산점").build();
        User requestedBy = User.builder().id(1L).name("박지수").build();

        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.REQUESTED)
                .store(store)
                .requestedBy(requestedBy)
                .build();

        given(orderRepository.findAll()).willReturn(List.of(order));
        given(orderItemRepository.findByOrderId(1L)).willReturn(List.of());

        // when
        var result = orderService.findAll();

        // then
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("발주 단건 조회 성공")
    void findById_success() {
        // given
        Store store = Store.builder().id(1L).name("신세계 천안아산점").build();
        User requestedBy = User.builder().id(1L).name("박지수").build();

        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.REQUESTED)
                .store(store)
                .requestedBy(requestedBy)
                .build();

        given(orderRepository.findById(1L)).willReturn(Optional.of(order));
        given(orderItemRepository.findByOrderId(1L)).willReturn(List.of());

        // when
        OrderResponseDto result = orderService.findById(1L);

        // then
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("발주 단건 조회 실패 - 없는 발주")
    void findById_fail_notFound() {
        // given
        given(orderRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> orderService.findById(1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("발주 출고 성공")
    void ship_success() {
        // given
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

        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.APPROVED)
                .store(store)
                .approvedBy(approvedBy)
                .requestedBy(approvedBy)
                .build();

        OrderItem item = OrderItem.builder()
                .productOption(productOption)
                .quantity(5)
                .build();

        Warehouse warehouse = Warehouse.builder().id(1L).build();
        WarehouseStock warehouseStock = WarehouseStock.builder()
                .warehouse(warehouse)
                .productOption(productOption)
                .quantity(100)
                .build();

        given(orderRepository.findById(1L)).willReturn(Optional.of(order));
        given(orderItemRepository.findByOrderId(1L)).willReturn(List.of(item));
        given(warehouseStockRepository.findByProductOptionId(1L))
                .willReturn(List.of(warehouseStock));

        // when
        OrderResponseDto result = orderService.ship(1L);

        // then
        assertThat(order.getStatus()).isEqualTo(OrderStatus.SHIPPED);
    }

    @Test
    @DisplayName("발주 입고완료 성공")
    void receive_success() {
        // given
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

        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.SHIPPED)
                .store(store)
                .approvedBy(approvedBy)
                .requestedBy(approvedBy)
                .build();

        OrderItem item = OrderItem.builder()
                .productOption(productOption)
                .quantity(5)
                .build();

        StoreStock storeStock = StoreStock.builder()
                .store(store)
                .productOption(productOption)
                .quantity(10)
                .build();

        given(orderRepository.findById(1L)).willReturn(Optional.of(order));
        given(orderItemRepository.findByOrderId(1L)).willReturn(List.of(item));
        given(storeStockRepository.findByStoreIdAndProductOptionId(1L, 1L))
                .willReturn(Optional.of(storeStock));

        // when
        OrderResponseDto result = orderService.receive(1L);

        // then
        assertThat(order.getStatus()).isEqualTo(OrderStatus.RECEIVED);
    }
    @Test
    @DisplayName("발주 반려 실패 - REQUESTED 상태가 아닌 경우")
    void reject_fail_invalidStatus() {
        // given
        Store store = Store.builder().id(1L).build();
        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.APPROVED)
                .store(store)
                .build();

        given(orderRepository.findById(1L)).willReturn(Optional.of(order));

        // when & then
        assertThatThrownBy(() -> orderService.reject(1L, 1L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("발주 입고완료 실패 - SHIPPED 상태가 아닌 경우")
    void receive_fail_invalidStatus() {
        // given
        Store store = Store.builder().id(1L).build();
        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.APPROVED)
                .store(store)
                .build();

        given(orderRepository.findById(1L)).willReturn(Optional.of(order));

        // when & then
        assertThatThrownBy(() -> orderService.receive(1L))
                .isInstanceOf(BusinessException.class);
    }
}