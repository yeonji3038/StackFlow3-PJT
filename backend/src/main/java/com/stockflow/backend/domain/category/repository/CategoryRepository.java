package com.stockflow.backend.domain.category.repository;

import com.stockflow.backend.domain.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByParentIsNull(); // 최상위 카테고리(대분류)만 조회
}