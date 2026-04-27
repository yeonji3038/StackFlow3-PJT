package com.stockflow.backend.domain.store.service;

import com.stockflow.backend.domain.product.entity.ProductOption;
import com.stockflow.backend.domain.product.repository.ProductOptionRepository;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryReason;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryType;
import com.stockflow.backend.domain.stockhistory.service.StockHistoryService;
import com.stockflow.backend.domain.store.dto.StoreStockRequestDto;
import com.stockflow.backend.domain.store.dto.StoreStockResponseDto;
import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.store.entity.StoreStock;
import com.stockflow.backend.domain.store.repository.StoreRepository;
import com.stockflow.backend.domain.store.repository.StoreStockRepository;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.global.exception.BusinessException;
import com.stockflow.backend.global.exception.ErrorCode;
import com.stockflow.backend.global.kafka.dto.StockChangeEvent;
import com.stockflow.backend.global.kafka.producer.StockEventProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreStockService {

    private final StoreStockRepository storeStockRepository;
    private final StoreRepository storeRepository;
    private final ProductOptionRepository productOptionRepository;
    private final StockHistoryService stockHistoryService;
    private final UserRepository userRepository;
    private final StockEventProducer stockEventProducer;

    // 매장 재고 등록
    @Transactional
    @CacheEvict(value = "storeStocks", key = "#request.storeId")
    public StoreStockResponseDto create(StoreStockRequestDto request) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
        ProductOption productOption = productOptionRepository.findById(request.getProductOptionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_OPTION_NOT_FOUND));

        StoreStock storeStock = StoreStock.builder()
                .store(store)
                .productOption(productOption)
                .quantity(request.getQuantity())
                .build();

        return StoreStockResponseDto.from(storeStockRepository.save(storeStock));
    }

    // 매장 재고 전체 조회
    @Cacheable(value = "storeStocks", key = "#storeId")
    public List<StoreStockResponseDto> findAllByStoreId(Long storeId) {
        return storeStockRepository.findByStoreId(storeId).stream()
                .map(StoreStockResponseDto::from)
                .collect(Collectors.toList());
    }

    // 매장 재고 단건 조회
    public StoreStockResponseDto findById(Long id) {
        StoreStock storeStock = storeStockRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_STOCK_NOT_FOUND));
        return StoreStockResponseDto.from(storeStock);
    }

    // 매장 재고 수량 수정
    @Transactional
    @CacheEvict(value = "storeStocks", key = "#result.storeId")
    public StoreStockResponseDto update(Long id, StoreStockRequestDto request, String email) {
        StoreStock storeStock = storeStockRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_STOCK_NOT_FOUND));

        User updatedBy = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        int oldQty = storeStock.getQuantity();
        int newQty = request.getQuantity();
        int diff = newQty - oldQty;

        storeStock.updateQuantity(newQty);

        // 수량 변동이 있을 때만 이력 기록
        if (diff != 0) {
            StockHistoryType type = diff > 0 ? StockHistoryType.IN : StockHistoryType.OUT;
            StockHistoryReason reason = request.getReason() != null
                    ? request.getReason()
                    : StockHistoryReason.SALE;

            stockHistoryService.record(
                    storeStock.getStore(),
                    null,
                    storeStock.getProductOption(),
                    type,
                    reason,
                    Math.abs(diff),
                    updatedBy
            );
            // Kafka 이벤트 발행
            stockEventProducer.sendStockChangeEvent(
                    StockChangeEvent.builder()
                            .productId(storeStock.getProductOption().getId())
                            .productName(storeStock.getProductOption().getSkuCode())
                            .previousStock(oldQty)
                            .changedAmount(diff)
                            .currentStock(newQty)
                            .changeType(diff > 0 ? "INCREASE" : "DECREASE")
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        }

        return StoreStockResponseDto.from(storeStock);
    }

    // 매장 재고 삭제
    @Transactional
    @CacheEvict(value = "storeStocks", key = "#id")
    public void delete(Long id) {
        if (!storeStockRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.STORE_STOCK_NOT_FOUND);
        }
        storeStockRepository.deleteById(id);
    }
}