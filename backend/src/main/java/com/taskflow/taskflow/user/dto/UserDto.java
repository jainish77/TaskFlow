package com.taskflow.taskflow.user.dto;

import java.util.Set;

/**
 * Slim representation of the user we can safely send to the client.
 */
public record UserDto(
        Long id,
        String email,
        String fullName,
        Set<String> roles
) {
}

