package com.taskflow.taskflow.task;

import com.taskflow.taskflow.comment.CommentMapper;
import com.taskflow.taskflow.task.dto.TaskDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper that converts JPA entities into API-friendly DTOs.
 */
@Mapper(componentModel = "spring", uses = CommentMapper.class)
public interface TaskMapper {

    /**
     * Flatten the nested assignee email so the frontend does not need the full user object.
     */
    @Mapping(target = "assigneeEmail", source = "assignee.email")
    TaskDto toDto(TaskItem task);
}

