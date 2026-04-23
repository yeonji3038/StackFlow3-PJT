package com.stockflow.backend.domain.order.service;

import com.stockflow.backend.domain.order.dto.OrderRequestDto;
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
import com.stockflow.backend.domain.store.entity.StoreStock;
import com.stockflow.backend.domain.store.repository.StoreRepository;
import com.stockflow.backend.domain.store.repository.StoreStockRepository;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.domain.warehouse.entity.WarehouseStock;
import com.stockflow.backend.domain.warehouse.repository.WarehouseStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryType;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryReason;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final ProductOptionRepository productOptionRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final StoreStockRepository storeStockRepository;
    private final StockHistoryService stockHistoryService;

    // 발주 요청
    @Transactional
    public OrderResponseDto create(OrderRequestDto request) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new RuntimeException("매장을 찾을 수 없습니다."));
        User requestedBy = userRepository.findById(request.getRequestedById())
                .orElseThrow(() -> new RuntimeException("요청자를 찾을 수 없습니다."));

        Order order = Order.builder()
                .store(store)
                .status(OrderStatus.REQUESTED)
                .requestedBy(requestedBy)
                .note(request.getNote())
                .build();

        Order saved = orderRepository.save(order);

        // 발주 상세 저장
        for (OrderRequestDto.OrderItemDto itemDto : request.getItems()) {
            ProductOption productOption = productOptionRepository.findById(itemDto.getProductOptionId())
                    .orElseThrow(() -> new RuntimeException("상품 옵션을 찾을 수 없습니다."));

            OrderItem item = OrderItem.builder()
                    .order(saved)
                    .productOption(productOption)
                    .quantity(itemDto.getQuantity())
                    .build();

            orderItemRepository.save(item);
        }

        return OrderResponseDto.from(saved, orderItemRepository.findByOrderId(saved.getId()));
    }

    // 발주 전체 조회
    public List<OrderResponseDto> findAll() {
        return orderRepository.findAll().stream()
                .map(order -> OrderResponseDto.from(order,
                        orderItemRepository.findByOrderId(order.getId())))
                .collect(Collectors.toList());
    }

    // 발주 단건 조회
    public OrderResponseDto findById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("발주를 찾을 수 없습니다."));
        return OrderResponseDto.from(order, orderItemRepository.findByOrderId(id));
    }

    // 발주 승인 (본사)
    @Transactional
    public OrderResponseDto approve(Long id, Long approvedById) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("발주를 찾을 수 없습니다."));

        // 상태 체크
        if (order.getStatus() != OrderStatus.REQUESTED) {
            throw new RuntimeException("요청 상태의 발주만 승인할 수 있습니다. 현재 상태: " + order.getStatus());
        }

        User approvedBy = userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("승인자를 찾을 수 없습니다."));

        order.updateStatus(OrderStatus.APPROVED, approvedBy);
        return OrderResponseDto.from(order, orderItemRepository.findByOrderId(id));
    }

    // 발주 반려 (본사)
    @Transactional
    public OrderResponseDto reject(Long id, Long approvedById) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("발주를 찾을 수 없습니다."));

        // 상태 체크
        if (order.getStatus() != OrderStatus.REQUESTED) {
            throw new RuntimeException("요청 상태의 발주만 반려할 수 있습니다. 현재 상태: " + order.getStatus());
        }

        User approvedBy = userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("처리자를 찾을 수 없습니다."));

        order.updateStatus(OrderStatus.REJECTED, approvedBy);
        return OrderResponseDto.from(order, orderItemRepository.findByOrderId(id));
    }

    // 발주 출고 (본사 - 창고 재고 차감)
    @Transactional
    public OrderResponseDto ship(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("발주를 찾을 수 없습니다."));

        // 상태 체크
        if (order.getStatus() != OrderStatus.APPROVED) {
            throw new RuntimeException("승인된 발주만 출고할 수 있습니다. 현재 상태: " + order.getStatus());
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(id);

        // 창고 재고 차감 (첫 번째 창고에서 차감)
        for (OrderItem item : items) {
            List<WarehouseStock> warehouseStocks = warehouseStockRepository
                    .findByProductOptionId(item.getProductOption().getId());

            if (warehouseStocks.isEmpty()) {
                throw new RuntimeException("창고 재고를 찾을 수 없습니다. 상품 옵션 ID: " + item.getProductOption().getId());
            }

            WarehouseStock warehouseStock = warehouseStocks.get(0);

            // 재고 부족 체크
            if (warehouseStock.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("창고 재고가 부족합니다. 현재 재고: " + warehouseStock.getQuantity()
                        + ", 요청 수량: " + item.getQuantity());
            }

            warehouseStock.updateQuantity(warehouseStock.getQuantity() - item.getQuantity());

            // 창고 출고 이력 저장
            stockHistoryService.record(
                    null,
                    warehouseStock.getWarehouse(),
                    item.getProductOption(),
                    StockHistoryType.OUT,
                    StockHistoryReason.ORDER,
                    item.getQuantity(),
                    order.getApprovedBy()
            );
        }

        order.updateStatus(OrderStatus.SHIPPED, order.getApprovedBy());
        return OrderResponseDto.from(order, items);
    }

    // 발주 입고완료 (매장 - 매장 재고 증가)
    @Transactional
    public OrderResponseDto receive(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("발주를 찾을 수 없습니다."));

        // 상태 체크
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new RuntimeException("출고된 발주만 입고완료 처리할 수 있습니다. 현재 상태: " + order.getStatus());
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(id);

        // 매장 재고 증가
        for (OrderItem item : items) {
            StoreStock storeStock = storeStockRepository
                    .findByStoreIdAndProductOptionId(
                            order.getStore().getId(),
                            item.getProductOption().getId())
                    .orElseGet(() -> StoreStock.builder()
                            .store(order.getStore())
                            .productOption(item.getProductOption())
                            .quantity(0)
                            .build());

            storeStock.updateQuantity(storeStock.getQuantity() + item.getQuantity());
            storeStockRepository.save(storeStock);

            storeStock.updateQuantity(storeStock.getQuantity() + item.getQuantity());
            storeStockRepository.save(storeStock);

            // 매장 입고 이력 저장
            stockHistoryService.record(
                    order.getStore(),
                    null,
                    item.getProductOption(),
                    StockHistoryType.IN,
                    StockHistoryReason.ORDER,
                    item.getQuantity(),
                    order.getApprovedBy()
            );



        }

        order.updateStatus(OrderStatus.RECEIVED, order.getApprovedBy());
        return OrderResponseDto.from(order, items);
    }
}