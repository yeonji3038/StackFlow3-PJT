package com.stockflow.backend.domain.allocation.entity;

import com.stockflow.backend.domain.store.entity.Store;
import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import com.stockflow.backend.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "allocations")
public class Allocation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @Enumerated(EnumType.STRING)
    private AllocationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    public void updateStatus(AllocationStatus status, User approvedBy) {
        this.status = status;
        this.approvedBy = approvedBy;
    }
}