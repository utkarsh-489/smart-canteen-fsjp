package com.smartcanteen.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler({IllegalArgumentException.class, BadCredentialsException.class})
    ResponseEntity<?> badRequest(Exception e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }

    @ExceptionHandler(Exception.class)
    ResponseEntity<?> serverError(Exception e) { return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Server error", "detail", e.getMessage())); }
}
