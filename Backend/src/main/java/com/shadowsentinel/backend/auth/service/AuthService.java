package com.shadowsentinel.backend.auth.service;

import com.shadowsentinel.backend.auth.dto.AuthResponseDto;
import com.shadowsentinel.backend.auth.dto.LoginRequestDto;
import com.shadowsentinel.backend.auth.dto.RegisterRequestDto;
import com.shadowsentinel.backend.common.exception.InvalidPayloadException;
import com.shadowsentinel.backend.common.security.JwtTokenProvider;
import com.shadowsentinel.backend.user.entity.User;
import com.shadowsentinel.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final long jwtExpirationMs;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidPayloadException("Email is already registered: " + request.getEmail());
        }

        String role = (request.getRole() != null && request.getRole().equalsIgnoreCase("ADMIN")) ? "ADMIN" : "USER";
        String orgId = (request.getOrgId() != null && !request.getOrgId().isBlank()) ? request.getOrgId() : "DEFAULT_ORG";

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role,
                orgId
        );

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getOrgId()
        );

        return new AuthResponseDto(
                token,
                savedUser.getId(),
                savedUser.getOrgId(),
                savedUser.getEmail(),
                savedUser.getRole(),
                jwtExpirationMs
        );
    }

    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getOrgId()
        );

        return new AuthResponseDto(
                token,
                user.getId(),
                user.getOrgId(),
                user.getEmail(),
                user.getRole(),
                jwtExpirationMs
        );
    }
}
