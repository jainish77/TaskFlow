package com.taskflow.taskflow.task;

import com.taskflow.taskflow.comment.CommentMapper;
import com.taskflow.taskflow.comment.TaskComment;
import com.taskflow.taskflow.comment.dto.TaskCommentDto;
import com.taskflow.taskflow.task.dto.TaskDto;
import com.taskflow.taskflow.user.UserAccount;
import java.time.Instant;
import java.time.LocalDate;
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
public class TaskMapperImpl implements TaskMapper {

    @Autowired
    private CommentMapper commentMapper;

    @Override
    public TaskDto toDto(TaskItem task) {
        if ( task == null ) {
            return null;
        }

        String assigneeEmail = null;
        Long id = null;
        String title = null;
        String description = null;
        TaskStatus status = null;
        LocalDate dueDate = null;
        Instant createdAt = null;
        Instant updatedAt = null;
        List<TaskCommentDto> comments = null;

        assigneeEmail = taskAssigneeEmail( task );
        id = task.getId();
        title = task.getTitle();
        description = task.getDescription();
        status = task.getStatus();
        dueDate = task.getDueDate();
        createdAt = task.getCreatedAt();
        updatedAt = task.getUpdatedAt();
        comments = taskCommentListToTaskCommentDtoList( task.getComments() );

        TaskDto taskDto = new TaskDto( id, title, description, status, dueDate, assigneeEmail, createdAt, updatedAt, comments );

        return taskDto;
    }

    private String taskAssigneeEmail(TaskItem taskItem) {
        if ( taskItem == null ) {
            return null;
        }
        UserAccount assignee = taskItem.getAssignee();
        if ( assignee == null ) {
            return null;
        }
        String email = assignee.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    protected List<TaskCommentDto> taskCommentListToTaskCommentDtoList(List<TaskComment> list) {
        if ( list == null ) {
            return null;
        }

        List<TaskCommentDto> list1 = new ArrayList<TaskCommentDto>( list.size() );
        for ( TaskComment taskComment : list ) {
            list1.add( commentMapper.toDto( taskComment ) );
        }

        return list1;
    }
}
