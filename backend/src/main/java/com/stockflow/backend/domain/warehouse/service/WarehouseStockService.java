package com.stockflow.backend.domain.warehouse.service;

import com.stockflow.backend.domain.product.entity.ProductOption;
import com.stockflow.backend.domain.product.repository.ProductOptionRepository;
import com.stockflow.backend.domain.warehouse.dto.WarehouseStockRequestDto;
import com.stockflow.backend.domain.warehouse.dto.WarehouseStockResponseDto;
import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import com.stockflow.backend.domain.warehouse.entity.WarehouseStock;
import com.stockflow.backend.domain.warehouse.repository.WarehouseRepository;
import com.stockflow.backend.domain.warehouse.repository.WarehouseStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseStockService {

    private final WarehouseStockRepository warehouseStockRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductOptionRepository productOptionRepository;

    // 창고 재고 등록
    @Transactional
    public WarehouseStockResponseDto create(WarehouseStockRequestDto request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("창고를 찾을 수 없습니다."));
        ProductOption productOption = productOptionRepository.findById(request.getProductOptionId())
                .orElseThrow(() -> new RuntimeException("상품 옵션을 찾을 수 없습니다."));

        WarehouseStock warehouseStock = WarehouseStock.builder()
                .warehouse(warehouse)
                .productOption(productOption)
                .quantity(request.getQuantity())
                .build();

        return WarehouseStockResponseDto.from(warehouseStockRepository.save(warehouseStock));
    }

    // 특정 창고 재고 전체 조회
    public List<WarehouseStockResponseDto> findAllByWarehouseId(Long warehouseId) {
        return warehouseStockRepository.findByWarehouseId(warehouseId).stream()
                .map(WarehouseStockResponseDto::from)
                .collect(Collectors.toList());
    }

    // 창고 재고 단건 조회
    public WarehouseStockResponseDto findById(Long id) {
        WarehouseStock warehouseStock = warehouseStockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("창고 재고를 찾을 수 없습니다."));
        return WarehouseStockResponseDto.from(warehouseStock);
    }

    // 창고 재고 수량 수정
    @Transactional
    public WarehouseStockResponseDto update(Long id, WarehouseStockRequestDto request) {
        WarehouseStock warehouseStock = warehouseStockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("창고 재고를 찾을 수 없습니다."));
        warehouseStock.updateQuantity(request.getQuantity());
        return WarehouseStockResponseDto.from(warehouseStock);
    }

    // 창고 재고 삭제
    @Transactional
    public void delete(Long id) {
        if (!warehouseStockRepository.existsById(id)) {
            throw new RuntimeException("창고 재고를 찾을 수 없습니다.");
        }
        warehouseStockRepository.deleteById(id);
    }
}