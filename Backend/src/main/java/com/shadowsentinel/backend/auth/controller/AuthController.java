package com.shadowsentinel.backend.auth.controller;

import com.shadowsentinel.backend.auth.dto.AuthResponseDto;
import com.shadowsentinel.backend.auth.dto.LoginRequestDto;
import com.shadowsentinel.backend.auth.dto.RegisterRequestDto;
import com.shadowsentinel.backend.auth.service.AuthService;
import com.shadowsentinel.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping({"/api/v1/auth/register", "/auth/register"})
    public ResponseEntity<ApiResponse<AuthResponseDto>> register(@Valid @RequestBody RegisterRequestDto request) {
        AuthResponseDto response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping({"/api/v1/auth/login", "/auth/login"})
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        AuthResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
