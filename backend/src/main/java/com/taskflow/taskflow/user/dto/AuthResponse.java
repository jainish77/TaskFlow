package com.taskflow.taskflow.user.dto;

/**
 * Response body after successful authentication.
 * Includes both access and refresh tokens so the client can refresh when short-lived token expires.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserDto user
) {
}

