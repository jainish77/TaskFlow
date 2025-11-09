package com.taskflow.taskflow.comment;

import com.taskflow.taskflow.comment.dto.TaskCommentDto;
import com.taskflow.taskflow.user.UserAccount;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-09T16:07:09-0500",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Homebrew)"
)
@Component
public class CommentMapperImpl implements CommentMapper {

    @Override
    public TaskCommentDto toDto(TaskComment comment) {
        if ( comment == null ) {
            return null;
        }

        String authorEmail = null;
        Long id = null;
        String body = null;
        Instant createdAt = null;

        authorEmail = commentAuthorEmail( comment );
        id = comment.getId();
        body = comment.getBody();
        createdAt = comment.getCreatedAt();

        TaskCommentDto taskCommentDto = new TaskCommentDto( id, body, authorEmail, createdAt );

        return taskCommentDto;
    }

    private String commentAuthorEmail(TaskComment taskComment) {
        if ( taskComment == null ) {
            return null;
        }
        UserAccount author = taskComment.getAuthor();
        if ( author == null ) {
            return null;
        }
        String email = author.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }
}
