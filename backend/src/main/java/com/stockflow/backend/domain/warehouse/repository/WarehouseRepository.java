package com.stockflow.backend.domain.warehouse.repository;

import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
}
