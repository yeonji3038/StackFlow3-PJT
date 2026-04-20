package com.stockflow.backend.domain.store.service;

import com.stockflow.backend.domain.product.entity.ProductOption;
import com.stockflow.backend.domain.product.repository.ProductOptionRepository;
import com.stockflow.backend.domain.store.dto.StoreStockRequestDto;
import com.stockflow.backend.domain.store.dto.StoreStockResponseDto;
import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.store.entity.StoreStock;
import com.stockflow.backend.domain.store.repository.StoreRepository;
import com.stockflow.backend.domain.store.repository.StoreStockRepository;
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

    // 매장 재고 등록
    @Transactional
    public StoreStockResponseDto create(StoreStockRequestDto request) {
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new RuntimeException("매장을 찾을 수 없습니다."));
        ProductOption productOption = productOptionRepository.findById(request.getProductOptionId())
                .orElseThrow(() -> new RuntimeException("상품 옵션을 찾을 수 없습니다."));

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
                .orElseThrow(() -> new RuntimeException("매장 재고를 찾을 수 없습니다."));
        return StoreStockResponseDto.from(storeStock);
    }

    // 매장 재고 수량 수정
    @Transactional
    public StoreStockResponseDto update(Long id, StoreStockRequestDto request) {
        StoreStock storeStock = storeStockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("매장 재고를 찾을 수 없습니다."));
        storeStock.updateQuantity(request.getQuantity());
        return StoreStockResponseDto.from(storeStock);
    }

    // 매장 재고 삭제
    @Transactional
    public void delete(Long id) {
        if (!storeStockRepository.existsById(id)) {
            throw new RuntimeException("매장 재고를 찾을 수 없습니다.");
        }
        storeStockRepository.deleteById(id);
    }
}