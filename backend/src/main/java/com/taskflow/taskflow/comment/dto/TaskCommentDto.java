package com.taskflow.taskflow.comment.dto;

import java.time.Instant;

/**
 * Returned to the client after creating or listing comments.
 */
public record TaskCommentDto(
        Long id,
        String body,
        String authorEmail,
        Instant createdAt
) {
}

