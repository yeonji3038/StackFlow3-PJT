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

    // 배분 요청
    @Transactional
    public AllocationResponseDto create(AllocationRequestDto request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("창고를 찾을 수 없습니다."));
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new RuntimeException("매장을 찾을 수 없습니다."));
        User requestedBy = userRepository.findById(request.getRequestedById())
                .orElseThrow(() -> new RuntimeException("요청자를 찾을 수 없습니다."));

        Allocation allocation = Allocation.builder()
                .warehouse(warehouse)
                .store(store)
                .status(AllocationStatus.REQUESTED)
                .requestedBy(requestedBy)
                .build();

        Allocation saved = allocationRepository.save(allocation);

        // 배분 상세 저장
        for (AllocationRequestDto.AllocationItemDto itemDto : request.getItems()) {
            ProductOption productOption = productOptionRepository.findById(itemDto.getProductOptionId())
                    .orElseThrow(() -> new RuntimeException("상품 옵션을 찾을 수 없습니다."));

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
                .orElseThrow(() -> new RuntimeException("배분을 찾을 수 없습니다."));
        return AllocationResponseDto.from(allocation, allocationItemRepository.findByAllocationId(id));
    }

    // 배분 승인
    @Transactional
    public AllocationResponseDto approve(Long id, Long approvedById) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배분을 찾을 수 없습니다."));

        // 상태 체크 - REQUESTED 상태만 승인 가능
        if (allocation.getStatus() != AllocationStatus.REQUESTED) {
            throw new RuntimeException("요청 상태의 배분만 승인할 수 있습니다. 현재 상태: " + allocation.getStatus());
        }

        User approvedBy = userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("승인자를 찾을 수 없습니다."));

        allocation.updateStatus(AllocationStatus.APPROVED, approvedBy);
        return AllocationResponseDto.from(allocation, allocationItemRepository.findByAllocationId(id));
    }

    // 배분 출고 (창고 재고 차감)
    @Transactional
    public AllocationResponseDto ship(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배분을 찾을 수 없습니다."));

        // 상태 체크 - APPROVED 상태만 출고 가능
        if (allocation.getStatus() != AllocationStatus.APPROVED) {
            throw new RuntimeException("승인된 배분만 출고할 수 있습니다. 현재 상태: " + allocation.getStatus());
        }

        List<AllocationItem> items = allocationItemRepository.findByAllocationId(id);

        // 창고 재고 차감
        for (AllocationItem item : items) {
            WarehouseStock warehouseStock = warehouseStockRepository
                    .findByWarehouseIdAndProductOptionId(
                            allocation.getWarehouse().getId(),
                            item.getProductOption().getId())
                    .orElseThrow(() -> new RuntimeException("창고 재고를 찾을 수 없습니다."));

            // 재고 부족 체크
            if (warehouseStock.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("창고 재고가 부족합니다. " +
                        "상품 옵션 ID: " + item.getProductOption().getId() +
                        ", 현재 재고: " + warehouseStock.getQuantity() +
                        ", 요청 수량: " + item.getQuantity());
            }

            warehouseStock.updateQuantity(warehouseStock.getQuantity() - item.getQuantity());
        }

        allocation.updateStatus(AllocationStatus.SHIPPED, allocation.getApprovedBy());
        return AllocationResponseDto.from(allocation, items);
    }

    // 배분 입고완료 (매장 재고 추가)
    @Transactional
    public AllocationResponseDto receive(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배분을 찾을 수 없습니다."));

        // 상태 체크 - SHIPPED 상태만 입고완료 가능
        if (allocation.getStatus() != AllocationStatus.SHIPPED) {
            throw new RuntimeException("출고된 배분만 입고완료 처리할 수 있습니다. 현재 상태: " + allocation.getStatus());
        }

        List<AllocationItem> items = allocationItemRepository.findByAllocationId(id);

        // 매장 재고 추가
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
        }

        allocation.updateStatus(AllocationStatus.RECEIVED, allocation.getApprovedBy());
        return AllocationResponseDto.from(allocation, items);
    }

    // 배분 취소
    @Transactional
    public AllocationResponseDto cancel(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("배분을 찾을 수 없습니다."));

        // 상태 체크 - RECEIVED 또는 이미 CANCELLED 상태는 취소 불가
        if (allocation.getStatus() == AllocationStatus.RECEIVED) {
            throw new RuntimeException("입고완료된 배분은 취소할 수 없습니다.");
        }
        if (allocation.getStatus() == AllocationStatus.CANCELLED) {
            throw new RuntimeException("이미 취소된 배분입니다.");
        }

        allocation.updateStatus(AllocationStatus.CANCELLED, allocation.getApprovedBy());
        return AllocationResponseDto.from(allocation, allocationItemRepository.findByAllocationId(id));
    }
}