package com.smartcanteen.service;

import com.smartcanteen.dto.CreateStaffRequest;
import com.smartcanteen.entity.*;
import com.smartcanteen.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminService {
    private final CustomerOrderRepository orders;
    private final AppUserRepository users;
    private final FeedbackRepository feedback;
    private final PasswordEncoder encoder;

    public AdminService(CustomerOrderRepository orders, AppUserRepository users, FeedbackRepository feedback, PasswordEncoder encoder) {
        this.orders = orders;
        this.users = users;
        this.feedback = feedback;
        this.encoder = encoder;
    }

    public Map<String, Object> dashboard() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        List<CustomerOrder> today = orders.findByCreatedAtBetween(start, end);
        BigDecimal revenue = today.stream().filter(o -> !o.getStatus().equals(OrderStatus.REJECTED))
                .map(CustomerOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Integer> popularity = new HashMap<>();
        for (CustomerOrder o : today) for (var item : o.getItems())
            popularity.merge(item.getMenuItem().getName(), item.getQuantity(), Integer::sum);
        List<Map<String, Object>> popular = popularity.entrySet().stream()
                .sorted((a,b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", e.getKey());
                    item.put("quantity", e.getValue());
                    return item;
                })
                .toList();
        long pending = today.stream().filter(o -> o.getStatus() == OrderStatus.NEW || o.getStatus() == OrderStatus.PREPARING || o.getStatus() == OrderStatus.READY).count();

        return Map.of("ordersToday", today.size(), "revenueToday", revenue, "pendingOrders", pending, "popularItems", popular,
                "recentOrders", orders.findAllByOrderByCreatedAtDesc().stream().limit(10).toList(), "feedback", feedback.findAllByOrderByCreatedAtDesc().stream().limit(10).toList());
    }

    public List<AppUser> users() { return users.findAll(); }

    public AppUser createStaff(Authentication authentication, CreateStaffRequest request) {
        if (request.name == null || request.name.isBlank() || request.email == null || request.email.isBlank()
                || request.password == null || request.password.length() < 6) {
            throw new IllegalArgumentException("Staff name, email and a password of at least 6 characters are required");
        }

        AppUser admin = users.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Admin account not found"));
        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only an Admin can create staff accounts");
        }
        if (admin.getCanteen() == null) {
            throw new IllegalArgumentException("Admin is not linked to a canteen");
        }

        String email = request.email.trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        return users.save(new AppUser(null, request.name.trim(), email,
                encoder.encode(request.password), Role.STAFF, false, admin.getCanteen()));
    }

    public AppUser setBlocked(Long id, boolean blocked) {
        AppUser u = users.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setBlocked(blocked);
        return users.save(u);
    }

    public List<Feedback> feedback() { return feedback.findAllByOrderByCreatedAtDesc(); }
}
