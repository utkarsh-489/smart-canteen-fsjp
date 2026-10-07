package com.smartcanteen.controller;

import com.smartcanteen.dto.CreateStaffRequest;
import com.smartcanteen.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    private final AdminService admin;
    public AdminController(AdminService admin) { this.admin = admin; }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() { return ResponseEntity.ok(admin.dashboard()); }

    @GetMapping("/users")
    public ResponseEntity<?> users() { return ResponseEntity.ok(admin.users()); }

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(Authentication authentication, @RequestBody CreateStaffRequest request) {
        return ResponseEntity.ok(admin.createStaff(authentication, request));
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> block(@PathVariable Long id) { return ResponseEntity.ok(admin.setBlocked(id, true)); }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblock(@PathVariable Long id) { return ResponseEntity.ok(admin.setBlocked(id, false)); }

    @GetMapping("/feedback")
    public ResponseEntity<?> feedback() { return ResponseEntity.ok(admin.feedback()); }
}
