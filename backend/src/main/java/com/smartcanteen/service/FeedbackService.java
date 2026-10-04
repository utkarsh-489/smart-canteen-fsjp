package com.smartcanteen.service;

import com.smartcanteen.dto.FeedbackRequest;
import com.smartcanteen.entity.*;
import com.smartcanteen.repository.AppUserRepository;
import com.smartcanteen.repository.CustomerOrderRepository;
import com.smartcanteen.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FeedbackService {
    private final FeedbackRepository feedback;
    private final CustomerOrderRepository orders;
    private final AppUserRepository users;

    public FeedbackService(FeedbackRepository feedback, CustomerOrderRepository orders, AppUserRepository users) {
        this.feedback = feedback; this.orders = orders; this.users = users;
    }

    public Feedback add(String email, FeedbackRequest r) {
        CustomerOrder order = orders.findById(r.orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        AppUser student = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Student not found"));
        if (!order.getStudent().getId().equals(student.getId())) throw new IllegalArgumentException("You can review only your order");
        if (order.getStatus() != OrderStatus.COLLECTED) throw new IllegalArgumentException("Order must be collected before feedback");
        if (feedback.existsByOrderId(order.getId())) throw new IllegalArgumentException("Feedback already submitted");
        if (r.rating == null || r.rating < 1 || r.rating > 5) throw new IllegalArgumentException("Rating must be 1 to 5");
        Feedback f = new Feedback(); f.setOrder(order); f.setStudent(student); f.setRating(r.rating); f.setComment(r.comment); f.setCreatedAt(LocalDateTime.now());
        return feedback.save(f);
    }
}
