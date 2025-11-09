package com.taskflow.taskflow.project.dto;

import com.taskflow.taskflow.task.dto.TaskDto;

import java.time.Instant;
import java.util.List;

/**
 * Outbound representation for projects.
 */
public record ProjectDto(
        Long id,
        String name,
        String description,
        String ownerEmail,
        Instant createdAt,
        List<TaskDto> tasks
) {
}

