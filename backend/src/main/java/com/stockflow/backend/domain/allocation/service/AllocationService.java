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
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryReason;
import com.stockflow.backend.domain.stockhistory.entity.StockHistoryType;
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
import com.stockflow.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final AllocationItemRepository allocationItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final ProductOptionRepository productOptionRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final StoreStockRepository storeStockRepository;
    private final StockHistoryService stockHistoryService;

    // 배분 요청
    @Transactional
    public AllocationResponseDto create(AllocationRequestDto request, String email) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new BusinessException(ErrorCode.WAREHOUSE_NOT_FOUND));
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // JWT 토큰에서 추출한 이메일로 요청자 조회
        User requestedBy = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Allocation allocation = Allocation.builder()
                .warehouse(warehouse)
                .store(store)
                .status(AllocationStatus.REQUESTED)
                .requestedBy(requestedBy)
                .build();

        Allocation saved = allocationRepository.save(allocation);

        for (AllocationRequestDto.AllocationItemDto itemDto : request.getItems()) {
            ProductOption productOption = productOptionRepository.findById(itemDto.getProductOptionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_OPTION_NOT_FOUND));

            AllocationItem item = AllocationItem.builder()
                    .allocation(saved)
                    .productOption(productOption)
                    .quantity(itemDto.getQuantity())
                    .build();

            allocationItemRepository.save(item);
        }

        return AllocationResponseDto.from(saved, allocationItemRepository.findByAllocationId(saved.getId()));
    }

    // 배분 전체 조회
    public List<AllocationResponseDto> findAll() {
        return allocationRepository.findAll().stream()
                .map(allocation -> AllocationResponseDto.from(allocation,
                        allocationItemRepository.findByAllocationId(allocation.getId())))
                .collect(Collectors.toList());
    }

    // 배분 단건 조회
    public AllocationResponseDto findById(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ALLOCATION_NOT_FOUND));
        return AllocationResponseDto.from(allocation, allocationItemRepository.findByAllocationId(id));
    }

    // 배분 승인
    @Transactional
    public AllocationResponseDto approve(Long id, Long approvedById) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ALLOCATION_NOT_FOUND));

        if (allocation.getStatus() != AllocationStatus.REQUESTED) {
            throw new BusinessException(ErrorCode.ALLOCATION_INVALID_STATUS);
        }

        User approvedBy = userRepository.findById(approvedById)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        allocation.updateStatus(AllocationStatus.APPROVED, approvedBy);
        return AllocationResponseDto.from(allocation, allocationItemRepository.findByAllocationId(id));
    }

    // 배분 출고 (창고 재고 차감)
    @Transactional
    public AllocationResponseDto ship(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ALLOCATION_NOT_FOUND));

        if (allocation.getStatus() != AllocationStatus.APPROVED) {
            throw new BusinessException(ErrorCode.ALLOCATION_INVALID_STATUS);
        }

        List<AllocationItem> items = allocationItemRepository.findByAllocationId(id);

        for (AllocationItem item : items) {
            WarehouseStock warehouseStock = warehouseStockRepository
                    .findByWarehouseIdAndProductOptionId(
                            allocation.getWarehouse().getId(),
                            item.getProductOption().getId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.WAREHOUSE_STOCK_NOT_FOUND));

            if (warehouseStock.getQuantity() < item.getQuantity()) {
                throw new BusinessException(ErrorCode.WAREHOUSE_STOCK_INSUFFICIENT);
            }

            warehouseStock.updateQuantity(warehouseStock.getQuantity() - item.getQuantity());

            stockHistoryService.record(
                    null,
                    allocation.getWarehouse(),
                    item.getProductOption(),
                    StockHistoryType.OUT,
                    StockHistoryReason.ALLOCATION,
                    item.getQuantity(),
                    allocation.getApprovedBy()
            );
        }

        allocation.updateStatus(AllocationStatus.SHIPPED, allocation.getApprovedBy());
        return AllocationResponseDto.from(allocation, items);
    }

    // 배분 입고완료 (매장 재고 추가)
    @Transactional
    public AllocationResponseDto receive(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ALLOCATION_NOT_FOUND));

        if (allocation.getStatus() != AllocationStatus.SHIPPED) {
            throw new BusinessException(ErrorCode.ALLOCATION_INVALID_STATUS);
        }

        List<AllocationItem> items = allocationItemRepository.findByAllocationId(id);

        for (AllocationItem item : items) {
            StoreStock storeStock = storeStockRepository
                    .findByStoreIdAndProductOptionId(
                            allocation.getStore().getId(),
                            item.getProductOption().getId())
                    .orElseGet(() -> StoreStock.builder()
                            .store(allocation.getStore())
                            .productOption(item.getProductOption())
                            .quantity(0)
                            .build());

            storeStock.updateQuantity(storeStock.getQuantity() + item.getQuantity());
            storeStockRepository.save(storeStock);

            stockHistoryService.record(
                    allocation.getStore(),
                    null,
                    item.getProductOption(),
                    StockHistoryType.IN,
                    StockHistoryReason.ALLOCATION,
                    item.getQuantity(),
                    allocation.getApprovedBy()
            );
        }

        allocation.updateStatus(AllocationStatus.RECEIVED, allocation.getApprovedBy());
        return AllocationResponseDto.from(allocation, items);
    }

    // 배분 취소
    @Transactional
    public AllocationResponseDto cancel(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ALLOCATION_NOT_FOUND));

        if (allocation.getStatus() == AllocationStatus.RECEIVED) {
            throw new BusinessException(ErrorCode.ALLOCATION_CANNOT_CANCEL);
        }
        if (allocation.getStatus() == AllocationStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.ALLOCATION_ALREADY_CANCELLED);
        }

        allocation.updateStatus(AllocationStatus.CANCELLED, allocation.getApprovedBy());
        return AllocationResponseDto.from(allocation, allocationItemRepository.findByAllocationId(id));
    }
}