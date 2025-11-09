package com.taskflow.taskflow.comment;

import com.taskflow.taskflow.comment.dto.TaskCommentDto;
import com.taskflow.taskflow.comment.TaskComment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Converts between `TaskComment` entity and DTO.
 */
@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "authorEmail", source = "author.email")
    TaskCommentDto toDto(TaskComment comment);
}

