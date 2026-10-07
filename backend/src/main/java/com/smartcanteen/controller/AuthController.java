package com.smartcanteen.controller;

import com.smartcanteen.dto.*;
import com.smartcanteen.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest r) { return ResponseEntity.ok(auth.register(r)); }

    @PostMapping("/setup-canteen")
    public ResponseEntity<?> setupCanteen(@RequestBody CanteenSetupRequest r) { return ResponseEntity.ok(auth.setupCanteen(r)); }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest r) { return ResponseEntity.ok(auth.login(r)); }
}
