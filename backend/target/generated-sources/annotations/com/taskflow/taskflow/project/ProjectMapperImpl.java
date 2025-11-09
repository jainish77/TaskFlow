package com.taskflow.taskflow.project;

import com.taskflow.taskflow.project.dto.ProjectDto;
import com.taskflow.taskflow.task.TaskItem;
import com.taskflow.taskflow.task.TaskMapper;
import com.taskflow.taskflow.task.dto.TaskDto;
import com.taskflow.taskflow.user.UserAccount;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-09T16:07:09-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Homebrew)"
)
@Component
public class ProjectMapperImpl implements ProjectMapper {

    @Autowired
    private TaskMapper taskMapper;

    @Override
    public ProjectDto toDto(Project project) {
        if ( project == null ) {
            return null;
        }

        String ownerEmail = null;
        Long id = null;
        String name = null;
        String description = null;
        Instant createdAt = null;
        List<TaskDto> tasks = null;

        ownerEmail = projectOwnerEmail( project );
        id = project.getId();
        name = project.getName();
        description = project.getDescription();
        createdAt = project.getCreatedAt();
        tasks = taskItemListToTaskDtoList( project.getTasks() );

        ProjectDto projectDto = new ProjectDto( id, name, description, ownerEmail, createdAt, tasks );

        return projectDto;
    }

    private String projectOwnerEmail(Project project) {
        if ( project == null ) {
            return null;
        }
        UserAccount owner = project.getOwner();
        if ( owner == null ) {
            return null;
        }
        String email = owner.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    protected List<TaskDto> taskItemListToTaskDtoList(List<TaskItem> list) {
        if ( list == null ) {
            return null;
        }

        List<TaskDto> list1 = new ArrayList<TaskDto>( list.size() );
        for ( TaskItem taskItem : list ) {
            list1.add( taskMapper.toDto( taskItem ) );
        }

        return list1;
    }
}
