package com.taskflow.taskflow.task.dto;

import com.taskflow.taskflow.comment.dto.TaskCommentDto;
import com.taskflow.taskflow.task.TaskStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Outbound representation for task cards.
 */
public record TaskDto(
        Long id,
        String title,
        String description,
        TaskStatus status,
        LocalDate dueDate,
        String assigneeEmail,
        Instant createdAt,
        Instant updatedAt,
        List<TaskCommentDto> comments
) {
}

