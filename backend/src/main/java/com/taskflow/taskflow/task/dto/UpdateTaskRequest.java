package com.taskflow.taskflow.task.dto;

import com.taskflow.taskflow.task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Payload used for updating an existing task.
 */
public record UpdateTaskRequest(
        @NotBlank String title,
        String description,
        @NotNull TaskStatus status,
        LocalDate dueDate,
        String assigneeEmail
) {
}

