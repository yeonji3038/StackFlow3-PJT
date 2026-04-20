package com.stockflow.backend.global.docs.warehouse;

import com.stockflow.backend.domain.warehouse.dto.WarehouseRequestDto;
import com.stockflow.backend.domain.warehouse.dto.WarehouseResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "창고", description = "창고 관리 API")
public interface WarehouseApiSpecification {

    @Operation(summary = "창고 생성", description = """
        💡 새로운 창고를 등록합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **name** : 창고명
        - **location** : 창고 위치
        - **managerId** : 담당자 ID
        
        **[ 응답 필드 ]**
        - **id** : 창고 ID
        - **name** : 창고명
        - **location** : 창고 위치
        - **managerId** : 담당자 ID
        - **managerName** : 담당자 이름
        """)
    @PostMapping
    ResponseEntity<WarehouseResponseDto> createWarehouse(@RequestBody @Valid WarehouseRequestDto request);

    @Operation(summary = "창고 전체 조회", description = """
        💡 전체 창고 목록을 조회합니다.
        
        ---
        
        **[ 응답 필드 ]**
        - **id** : 창고 ID
        - **name** : 창고명
        - **location** : 창고 위치
        - **managerId** : 담당자 ID
        - **managerName** : 담당자 이름
        """)
    @GetMapping
    ResponseEntity<List<WarehouseResponseDto>> getWarehouses();

    @Operation(summary = "창고 단건 조회", description = """
        💡 ID로 창고를 조회합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 조회할 창고 ID
        
        **[ 응답 필드 ]**
        - **id** : 창고 ID
        - **name** : 창고명
        - **location** : 창고 위치
        - **managerId** : 담당자 ID
        - **managerName** : 담당자 이름
        """)
    @GetMapping("/{id}")
    ResponseEntity<WarehouseResponseDto> getWarehouse(@PathVariable Long id);

    @Operation(summary = "창고 수정", description = """
        💡 창고 정보를 수정합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 수정할 창고 ID
        - **name** : 창고명
        - **location** : 창고 위치
        - **managerId** : 담당자 ID
        
        **[ 응답 필드 ]**
        - **id** : 창고 ID
        - **name** : 창고명
        - **location** : 창고 위치
        - **managerId** : 담당자 ID
        - **managerName** : 담당자 이름
        """)
    @PutMapping("/{id}")
    ResponseEntity<WarehouseResponseDto> updateWarehouse(@PathVariable Long id, @RequestBody @Valid WarehouseRequestDto request);

    @Operation(summary = "창고 삭제", description = """
        💡 창고를 삭제합니다.
        
        ---
        
        **[ 요청 값 ]**
        - **id** : 삭제할 창고 ID
        """)
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWarehouse(@PathVariable Long id);
}