package com.shadowsentinel.backend.auth;

import com.shadowsentinel.backend.auth.dto.AuthResponseDto;
import com.shadowsentinel.backend.auth.dto.LoginRequestDto;
import com.shadowsentinel.backend.auth.dto.RegisterRequestDto;
import com.shadowsentinel.backend.auth.service.AuthService;
import com.shadowsentinel.backend.common.exception.InvalidPayloadException;
import com.shadowsentinel.backend.common.security.JwtTokenProvider;
import com.shadowsentinel.backend.user.entity.User;
import com.shadowsentinel.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, tokenProvider, 3600000L);
    }

    @Test
    void register_ValidUser_ReturnsAuthResponse() {
        RegisterRequestDto request = new RegisterRequestDto("test@example.com", "password123", "USER", "ORG1");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");

        UUID generatedId = UUID.randomUUID();
        User savedUser = new User("test@example.com", "encoded_password", "USER", "ORG1");
        savedUser.setId(generatedId);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateToken(generatedId, "test@example.com", "USER", "ORG1")).thenReturn("mock.jwt.token");

        AuthResponseDto response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getJwt());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("USER", response.getRole());

        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequestDto request = new RegisterRequestDto("existing@example.com", "password123", "USER", "ORG1");
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(InvalidPayloadException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ValidCredentials_ReturnsAuthResponse() {
        LoginRequestDto request = new LoginRequestDto("test@example.com", "password123");
        UUID userId = UUID.randomUUID();
        User user = new User("test@example.com", "hashed_pass", "USER", "ORG1");
        user.setId(userId);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed_pass")).thenReturn(true);
        when(tokenProvider.generateToken(userId, "test@example.com", "USER", "ORG1")).thenReturn("jwt.token.valid");

        AuthResponseDto response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt.token.valid", response.getJwt());
        assertEquals(userId, response.getUserId());
    }

    @Test
    void login_InvalidPassword_ThrowsBadCredentials() {
        LoginRequestDto request = new LoginRequestDto("test@example.com", "wrongpass");
        User user = new User("test@example.com", "hashed_pass", "USER", "ORG1");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "hashed_pass")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
