package com.stockflow.backend.domain.allocation.repository;

import com.stockflow.backend.domain.allocation.entity.AllocationItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AllocationItemRepository extends JpaRepository<AllocationItem, Long> {

    // 특정 배분의 상세 목록 조회
    List<AllocationItem> findByAllocationId(Long allocationId);
}