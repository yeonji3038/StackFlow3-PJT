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
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryReason;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryType;
import com.stockflow.backend.domain.stockhistory.service.StockHistoryService;
import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.store.entity.StoreStock;
import com.stockflow.backend.domain.store.repository.StoreRepository;
import com.stockflow.backend.domain.store.repository.StoreStockRepository;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.domain.warehouse.entity.WarehouseStock;
import com.stockflow.backend.domain.warehouse.repository.WarehouseStockRepository;
import com.stockflow.backend.global.exception.BusinessException;
import com.stockflow.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public OrderResponseDto create(OrderRequestDto request, String email) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // JWT 토큰에서 추출한 이메일로 요청자 조회
        User requestedBy = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Order order = Order.builder()
                .store(store)
                .status(OrderStatus.REQUESTED)
                .requestedBy(requestedBy)
                .note(request.getNote())
                .build();

        Order saved = orderRepository.save(order);

        for (OrderRequestDto.OrderItemDto itemDto : request.getItems()) {
            ProductOption productOption = productOptionRepository.findById(itemDto.getProductOptionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_OPTION_NOT_FOUND));

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
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        return OrderResponseDto.from(order, orderItemRepository.findByOrderId(id));
    }

    // 발주 승인
    @Transactional
    public OrderResponseDto approve(Long id, Long approvedById) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.REQUESTED) {
            throw new BusinessException(ErrorCode.ORDER_INVALID_STATUS);
        }

        User approvedBy = userRepository.findById(approvedById)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        order.updateStatus(OrderStatus.APPROVED, approvedBy);
        return OrderResponseDto.from(order, orderItemRepository.findByOrderId(id));
    }

    // 발주 반려
    @Transactional
    public OrderResponseDto reject(Long id, Long approvedById) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.REQUESTED) {
            throw new BusinessException(ErrorCode.ORDER_INVALID_STATUS);
        }

        User approvedBy = userRepository.findById(approvedById)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        order.updateStatus(OrderStatus.REJECTED, approvedBy);
        return OrderResponseDto.from(order, orderItemRepository.findByOrderId(id));
    }

    // 발주 출고
    @Transactional
    public OrderResponseDto ship(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.APPROVED) {
            throw new BusinessException(ErrorCode.ORDER_INVALID_STATUS);
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(id);

        for (OrderItem item : items) {
            List<WarehouseStock> warehouseStocks = warehouseStockRepository
                    .findByProductOptionId(item.getProductOption().getId());

            if (warehouseStocks.isEmpty()) {
                throw new BusinessException(ErrorCode.WAREHOUSE_STOCK_NOT_FOUND);
            }

            WarehouseStock warehouseStock = warehouseStocks.get(0);

            if (warehouseStock.getQuantity() < item.getQuantity()) {
                throw new BusinessException(ErrorCode.WAREHOUSE_STOCK_INSUFFICIENT);
            }

            warehouseStock.updateQuantity(warehouseStock.getQuantity() - item.getQuantity());

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

    // 발주 입고완료
    @Transactional
    public OrderResponseDto receive(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new BusinessException(ErrorCode.ORDER_INVALID_STATUS);
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(id);

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