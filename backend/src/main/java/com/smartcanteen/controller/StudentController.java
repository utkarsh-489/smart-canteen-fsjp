package com.smartcanteen.controller;

import com.smartcanteen.dto.FeedbackRequest;
import com.smartcanteen.dto.OrderRequest;
import com.smartcanteen.service.FeedbackService;
import com.smartcanteen.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {
    private final OrderService orders;
    private final FeedbackService feedback;
    public StudentController(OrderService orders, FeedbackService feedback) { this.orders = orders; this.feedback = feedback; }

    @GetMapping("/orders") public ResponseEntity<?> myOrders(Authentication a) { return ResponseEntity.ok(orders.forStudent(a.getName())); }
    @PostMapping("/orders") public ResponseEntity<?> place(Authentication a, @RequestBody OrderRequest r) { return ResponseEntity.ok(orders.place(a.getName(), r)); }
    @PostMapping("/feedback") public ResponseEntity<?> addFeedback(Authentication a, @RequestBody FeedbackRequest r) { return ResponseEntity.ok(feedback.add(a.getName(), r)); }
}
