package com.taskflow.taskflow.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Incoming payload when a user signs up.
 * Validation annotations allow Spring to return 400 responses automatically when bad input arrives.
 */
public record RegisterRequest(
        @Email String email,
        @NotBlank String fullName,
        @Size(min = 8, message = "Password must be at least 8 chars") String password
) {
}

