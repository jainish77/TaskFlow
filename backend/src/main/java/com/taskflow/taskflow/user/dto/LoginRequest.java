package com.taskflow.taskflow.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Payload used for the login endpoint.
 */
public record LoginRequest(
        @Email String email,
        @NotBlank String password
) {
}

