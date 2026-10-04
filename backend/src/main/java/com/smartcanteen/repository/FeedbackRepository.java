package com.smartcanteen.repository;

import com.smartcanteen.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findAllByOrderByCreatedAtDesc();
    boolean existsByOrderId(Long orderId);
}
