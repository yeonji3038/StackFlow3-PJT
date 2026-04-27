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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // 매장 재고 등록
    @Transactional
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

    // 특정 매장 재고 전체 조회
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
        }

        return StoreStockResponseDto.from(storeStock);
    }

    // 매장 재고 삭제
    @Transactional
    public void delete(Long id) {
        if (!storeStockRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.STORE_STOCK_NOT_FOUND);
        }
        storeStockRepository.deleteById(id);
    }
}