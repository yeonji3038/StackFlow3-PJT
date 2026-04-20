package com.stockflow.backend.domain.store.entity;

import com.stockflow.backend.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "stores")
public class Store extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String location;

    @Enumerated(EnumType.STRING)
    private StoreType storeType;

    private String phone;

    public void update(String name, String location, StoreType storeType, String phone) {
        this.name = name;
        this.location = location;
        this.storeType = storeType;
        this.phone = phone;
    }
}