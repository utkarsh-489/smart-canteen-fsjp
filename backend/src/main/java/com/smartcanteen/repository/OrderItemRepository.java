package com.smartcanteen.repository;

import com.smartcanteen.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    boolean existsByMenuItem_Id(Long menuItemId);
}
