package com.smartcanteen.service;

import com.smartcanteen.dto.AuthResponse;
import com.smartcanteen.dto.LoginRequest;
import com.smartcanteen.dto.RegisterRequest;
import com.smartcanteen.entity.AppUser;
import com.smartcanteen.entity.Role;
import com.smartcanteen.repository.AppUserRepository;
import com.smartcanteen.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final com.smartcanteen.security.CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthService(AppUserRepository users, PasswordEncoder encoder, AuthenticationManager authenticationManager,
                       com.smartcanteen.security.CustomUserDetailsService userDetailsService, JwtService jwtService) {
        this.users = users; this.encoder = encoder; this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService; this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (request.name == null || request.name.isBlank() || request.email == null || request.password == null) {
            throw new IllegalArgumentException("Name, email and password are required");
        }
        if (users.existsByEmail(request.email.toLowerCase())) {
            throw new IllegalArgumentException("Email already registered");
        }
        AppUser saved = users.save(new AppUser(null, request.name.trim(), request.email.trim().toLowerCase(),
                encoder.encode(request.password), Role.STUDENT, false));
        UserDetails details = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtService.generateToken(details, saved.getRole().name());
        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findByEmail(request.email == null ? "" : request.email.toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (user.isBlocked()) throw new BadCredentialsException("This account is blocked by admin");
        if (request.role != null && !request.role.isBlank() && !user.getRole().name().equals(request.role.toUpperCase())) {
            throw new BadCredentialsException("Selected role does not match this account");
        }
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), request.password));
        UserDetails details = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(details, user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
