package com.taskflow.taskflow.user;

import com.taskflow.taskflow.security.JwtService;
import com.taskflow.taskflow.user.dto.AuthResponse;
import com.taskflow.taskflow.user.dto.LoginRequest;
import com.taskflow.taskflow.user.dto.RegisterRequest;
import com.taskflow.taskflow.user.dto.UserDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST endpoints for sign-up, login, and refreshing tokens.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService.UserMapper userMapper;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserService.UserMapper userMapper) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.emailTaken(request.email())) {
            // 409 so the UI knows to show a “user exists” message.
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        UserAccount user = userService.createMember(request.email(), request.fullName(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(generateTokens(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // Delegate to Spring Security to check the password and populate the context.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserAccount user = userService.getByEmail(request.email());
        return ResponseEntity.ok(generateTokens(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String refreshToken = authHeader.substring(7);
        try {
            var decoded = jwtService.verify(refreshToken);
            if (!"REFRESH".equals(decoded.getClaim("type").asString())) {
                // Reject access tokens presented to the refresh endpoint.
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            UserAccount user = userService.getByEmail(decoded.getSubject());
            return ResponseEntity.ok(generateTokens(user));
        } catch (Exception tokenError) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    private AuthResponse generateTokens(UserAccount user) {
        Map<String, String> claims = Map.of("fullName", user.getFullName());
        String accessToken = jwtService.createAccessToken(user.getEmail(), claims);
        String refreshToken = jwtService.createRefreshToken(user.getEmail());
        UserDto dto = userMapper.toDto(user);
        return new AuthResponse(accessToken, refreshToken, dto);
    }
}

