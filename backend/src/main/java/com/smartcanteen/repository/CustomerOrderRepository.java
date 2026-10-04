package com.smartcanteen.repository;

import com.smartcanteen.entity.AppUser;
import com.smartcanteen.entity.CustomerOrder;
import com.smartcanteen.entity.OrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByStudentOrderByCreatedAtDesc(AppUser student);
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
    List<CustomerOrder> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByStatusInAndCreatedAtLessThanEqual(
        List<OrderStatus> statuses,
        LocalDateTime createdAt
);
}
