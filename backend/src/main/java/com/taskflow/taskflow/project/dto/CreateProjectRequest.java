package com.taskflow.taskflow.project.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Minimal fields needed to create a project.
 */
public record CreateProjectRequest(
        @NotBlank String name,
        String description
) {
}

