package com.smartcanteen.controller;

import com.smartcanteen.dto.AcceptOrderRequest;
import com.smartcanteen.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:5173")
public class StaffController {
    private final OrderService orders;
    public StaffController(OrderService orders) { this.orders = orders; }
    @GetMapping("/orders") public ResponseEntity<?> all() { return ResponseEntity.ok(orders.all()); }
    @PutMapping("/orders/{id}/accept") public ResponseEntity<?> accept(@PathVariable Long id, @RequestBody AcceptOrderRequest r) { return ResponseEntity.ok(orders.accept(id, r)); }
    @PutMapping("/orders/{id}/reject") public ResponseEntity<?> reject(@PathVariable Long id) { return ResponseEntity.ok(orders.reject(id)); }
    @PutMapping("/orders/{id}/ready") public ResponseEntity<?> ready(@PathVariable Long id) { return ResponseEntity.ok(orders.ready(id)); }
    @PutMapping("/orders/{id}/collect") public ResponseEntity<?> collect(@PathVariable Long id) { return ResponseEntity.ok(orders.collect(id)); }
}
