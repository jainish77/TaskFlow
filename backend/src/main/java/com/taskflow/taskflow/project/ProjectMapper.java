package com.taskflow.taskflow.project;

import com.taskflow.taskflow.project.dto.ProjectDto;
import com.taskflow.taskflow.task.TaskMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Translates `Project` entities to DTOs including nested tasks.
 */
@Mapper(componentModel = "spring", uses = {TaskMapper.class})
public interface ProjectMapper {

    @Mapping(target = "ownerEmail", source = "owner.email")
    ProjectDto toDto(Project project);
}

