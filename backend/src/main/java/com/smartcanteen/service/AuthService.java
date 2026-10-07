package com.smartcanteen.service;

import com.smartcanteen.dto.*;
import com.smartcanteen.entity.AppUser;
import com.smartcanteen.entity.Canteen;
import com.smartcanteen.entity.Role;
import com.smartcanteen.repository.AppUserRepository;
import com.smartcanteen.repository.CanteenRepository;
import com.smartcanteen.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AppUserRepository users;
    private final CanteenRepository canteens;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final com.smartcanteen.security.CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthService(AppUserRepository users, CanteenRepository canteens, PasswordEncoder encoder,
                       AuthenticationManager authenticationManager,
                       com.smartcanteen.security.CustomUserDetailsService userDetailsService,
                       JwtService jwtService) {
        this.users = users;
        this.canteens = canteens;
        this.encoder = encoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (request.name == null || request.name.isBlank() || request.email == null || request.password == null) {
            throw new IllegalArgumentException("Name, email and password are required");
        }
        if (request.password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        if (users.existsByEmail(request.email.trim().toLowerCase())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Canteen canteen = canteens.findTopByOrderByIdAsc()
                .orElseThrow(() -> new IllegalArgumentException("Canteen setup is required before student registration"));

        AppUser saved = users.save(new AppUser(null, request.name.trim(), request.email.trim().toLowerCase(),
                encoder.encode(request.password), Role.STUDENT, false, canteen));
        return createResponse(saved);
    }

    @Transactional
    public AuthResponse setupCanteen(CanteenSetupRequest request) {
        if (request.canteenName == null || request.canteenName.isBlank()
                || request.collegeName == null || request.collegeName.isBlank()
                || request.location == null || request.location.isBlank()
                || request.adminName == null || request.adminName.isBlank()
                || request.adminEmail == null || request.adminEmail.isBlank()
                || request.password == null || request.password.length() < 6) {
            throw new IllegalArgumentException("All canteen and admin fields are required; password must be at least 6 characters");
        }
        if (!request.password.equals(request.confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        String email = request.adminEmail.trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (canteens.count() > 0) {
            throw new IllegalArgumentException("This installation already has a canteen configured. Please sign in as Admin.");
        }

        Canteen canteen = canteens.save(new Canteen(null, request.canteenName.trim(), request.collegeName.trim(), request.location.trim()));
        AppUser admin = users.save(new AppUser(null, request.adminName.trim(), email,
                encoder.encode(request.password), Role.ADMIN, false, canteen));
        return createResponse(admin);
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findByEmail(request.email == null ? "" : request.email.toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (user.isBlocked()) throw new BadCredentialsException("This account is blocked by admin");
        if (request.role != null && !request.role.isBlank() && !user.getRole().name().equals(request.role.toUpperCase())) {
            throw new BadCredentialsException("Selected role does not match this account");
        }
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), request.password));
        return createResponse(user);
    }

    private AuthResponse createResponse(AppUser user) {
        UserDetails details = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(details, user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
