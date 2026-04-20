package com.stockflow.backend.domain.allocation.repository;

import com.stockflow.backend.domain.allocation.entity.Allocation;
import com.stockflow.backend.domain.allocation.entity.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AllocationRepository extends JpaRepository<Allocation, Long> {

    // 특정 매장의 배분 목록 조회
    List<Allocation> findByStoreId(Long storeId);

    // 특정 창고의 배분 목록 조회
    List<Allocation> findByWarehouseId(Long warehouseId);

    // 상태별 배분 목록 조회
    List<Allocation> findByStatus(AllocationStatus status);
}