package com.smartcanteen.repository;

import com.smartcanteen.entity.Canteen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CanteenRepository extends JpaRepository<Canteen, Long> {
    Optional<Canteen> findTopByOrderByIdAsc();
}
