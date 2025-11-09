package com.taskflow.taskflow.project.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload used to update an existing project.
 */
public record UpdateProjectRequest(
        @NotBlank String name,
        String description
) {
}

