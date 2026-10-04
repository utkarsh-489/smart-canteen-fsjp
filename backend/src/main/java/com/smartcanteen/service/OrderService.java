package com.smartcanteen.service;

import com.smartcanteen.dto.AcceptOrderRequest;
import com.smartcanteen.dto.OrderRequest;
import com.smartcanteen.entity.*;
import com.smartcanteen.repository.AppUserRepository;
import com.smartcanteen.repository.CustomerOrderRepository;
import com.smartcanteen.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {
    private final CustomerOrderRepository orders;
    private final AppUserRepository users;
    private final MenuItemRepository menu;

    public OrderService(CustomerOrderRepository orders, AppUserRepository users, MenuItemRepository menu) {
        this.orders = orders; this.users = users; this.menu = menu;
    }

    @Transactional
    public CustomerOrder place(String email, OrderRequest request) {
        AppUser student = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Student not found"));
        if (request.items == null || request.items.isEmpty()) throw new IllegalArgumentException("Cart is empty");

        CustomerOrder order = new CustomerOrder();
        order.setStudent(student);
        order.setTokenNumber(nextToken());
        order.setStatus(OrderStatus.NEW);
        order.setPaymentStatus("SUCCESS");
        order.setPaymentMethod(request.paymentMethod == null ? "DEMO-UPI" : request.paymentMethod);
        order.setNotes(request.notes);
        order.setCreatedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        for (OrderRequest.Item input : request.items) {
            MenuItem item = menu.findById(input.menuItemId).orElseThrow(() -> new IllegalArgumentException("Menu item not found"));
            if (!item.isAvailable()) throw new IllegalArgumentException(item.getName() + " is currently unavailable");
            int qty = input.quantity == null ? 1 : input.quantity;
            if (qty <= 0) throw new IllegalArgumentException("Invalid quantity");
            BigDecimal price = item.isTodayOffer() && item.getOfferPrice() != null ? item.getOfferPrice() : item.getPrice();
            OrderItem oi = new OrderItem();
            oi.setOrder(order); oi.setMenuItem(item); oi.setQuantity(qty); oi.setUnitPrice(price); oi.setSubtotal(price.multiply(BigDecimal.valueOf(qty)));
            order.getItems().add(oi);
            total = total.add(oi.getSubtotal());
        }
        order.setTotalAmount(total);
        return orders.save(order);
    }

    public List<CustomerOrder> forStudent(String email) {
    AppUser student = users.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

    List<CustomerOrder> result =
            orders.findByStudentOrderByCreatedAtDesc(student);

    List<OrderStatus> activeStatuses =
            List.of(OrderStatus.NEW, OrderStatus.PREPARING);

    for (CustomerOrder order : result) {
        if (order.getStatus() == OrderStatus.NEW ||
            order.getStatus() == OrderStatus.PREPARING) {

            long ahead = orders.countByStatusInAndCreatedAtLessThanEqual(
                    activeStatuses,
                    order.getCreatedAt()
            );

            order.setQueuePosition((int) ahead);
        } else {
            order.setQueuePosition(null);
        }
    }

    return result;
}

    public List<CustomerOrder> all() { return orders.findAllByOrderByCreatedAtDesc(); }

    public CustomerOrder get(Long id) { return orders.findById(id).orElseThrow(() -> new IllegalArgumentException("Order not found")); }

    @Transactional
    public CustomerOrder accept(Long id, AcceptOrderRequest req) {
        CustomerOrder o = get(id);
        if (o.getStatus() != OrderStatus.NEW) throw new IllegalArgumentException("Only new orders can be accepted");
        o.setStatus(OrderStatus.PREPARING);
        o.setEstimatedMinutes(req.estimatedMinutes == null ? 10 : Math.max(1, req.estimatedMinutes));
        o.setAcceptedAt(LocalDateTime.now());
        return orders.save(o);
    }

    @Transactional
    public CustomerOrder reject(Long id) {
        CustomerOrder o = get(id);
        if (o.getStatus() != OrderStatus.NEW) throw new IllegalArgumentException("Only new orders can be rejected");
        o.setStatus(OrderStatus.REJECTED);
        return orders.save(o);
    }

    @Transactional
    public CustomerOrder ready(Long id) {
        CustomerOrder o = get(id);
        if (o.getStatus() != OrderStatus.PREPARING) throw new IllegalArgumentException("Only preparing orders can be marked ready");
        o.setStatus(OrderStatus.READY); o.setReadyAt(LocalDateTime.now());
        return orders.save(o);
    }

    @Transactional
    public CustomerOrder collect(Long id) {
        CustomerOrder o = get(id);
        if (o.getStatus() != OrderStatus.READY) throw new IllegalArgumentException("Only ready orders can be collected");
        o.setStatus(OrderStatus.COLLECTED); o.setCollectedAt(LocalDateTime.now());
        return orders.save(o);
    }

    private String nextToken() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        long count = orders.countByCreatedAtBetween(start, start.plusDays(1));
        return "C" + (19 + count + 1);
    }
}
