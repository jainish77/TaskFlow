package com.taskflow.taskflow.task.dto;

import com.taskflow.taskflow.task.TaskStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Simple PATCH payload to move a task through the workflow.
 */
public record UpdateTaskStatusRequest(
        @NotNull TaskStatus status
) {
}

