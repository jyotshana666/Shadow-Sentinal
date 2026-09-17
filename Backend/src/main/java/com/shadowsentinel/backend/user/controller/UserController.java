package com.shadowsentinel.backend.user.controller;

import com.shadowsentinel.backend.common.response.ApiResponse;
import com.shadowsentinel.backend.common.security.UserPrincipal;
import com.shadowsentinel.backend.user.dto.UserResponseDto;
import com.shadowsentinel.backend.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping({"/api/v1/users/me", "/users/me"})
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponseDto user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping({"/api/v1/users/me/blocked-domains", "/api/users/me/blocked-domains", "/users/me/blocked-domains"})
    public ResponseEntity<Map<String, Object>> getBlockedDomains(@AuthenticationPrincipal UserPrincipal principal) {
        List<String> blocked = userService.getBlockedDomainsForUser(principal.getId());
        Map<String, Object> resp = new HashMap<>();
        resp.put("blockedDomains", blocked);
        return ResponseEntity.ok(resp);
    }

    @GetMapping({"/api/v1/users/{id}", "/users/{id}"})
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable UUID id) {
        UserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping({"/api/v1/users", "/users"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        List<UserResponseDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
