package com.stockflow.backend.domain.warehouse.service;

import com.stockflow.backend.domain.user.entity.User;
import com.stockflow.backend.domain.user.repository.UserRepository;
import com.stockflow.backend.domain.warehouse.dto.WarehouseResponseDto;
import com.stockflow.backend.domain.warehouse.entity.Warehouse;
import com.stockflow.backend.domain.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stockflow.backend.domain.warehouse.dto.WarehouseRequestDto;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;

    // 창고 생성
    @Transactional
    public WarehouseResponseDto create(WarehouseRequestDto request) {
        User manager = userRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("담당자를 찾을 수 없습니다."));

        Warehouse warehouse = Warehouse.builder()
                .name(request.getName())
                .location(request.getLocation())
                .manager(manager)
                .build();

        return WarehouseResponseDto.from(warehouseRepository.save(warehouse));
    }

    // 창고 전체 조회
    public List<WarehouseResponseDto> findAll() {
        return warehouseRepository.findAll().stream()
                .map(WarehouseResponseDto::from)
                .collect(Collectors.toList());
    }

    // 창고 단건 조회
    public WarehouseResponseDto findById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("창고를 찾을 수 없습니다."));
        return WarehouseResponseDto.from(warehouse);
    }

    // 창고 수정
    @Transactional
    public WarehouseResponseDto update(Long id, WarehouseRequestDto request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("창고를 찾을 수 없습니다."));

        User manager = userRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("담당자를 찾을 수 없습니다."));

        warehouse.update(request.getName(), request.getLocation(), manager);
        return WarehouseResponseDto.from(warehouse);
    }

    // 창고 삭제
    @Transactional
    public void delete(Long id) {
        if (!warehouseRepository.existsById(id)) {
            throw new RuntimeException("창고를 찾을 수 없습니다.");
        }
        warehouseRepository.deleteById(id);
    }
}