package com.stockflow.backend.domain.season.repository;

import com.stockflow.backend.domain.season.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeasonRepository extends JpaRepository<Season, Long> {
}