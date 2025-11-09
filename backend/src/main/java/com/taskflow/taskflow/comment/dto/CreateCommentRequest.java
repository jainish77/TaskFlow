package com.taskflow.taskflow.comment.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload for adding a new comment.
 */
public record CreateCommentRequest(
        @NotBlank String body
) {
}

