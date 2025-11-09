package com.taskflow.taskflow.comment;

import com.taskflow.taskflow.task.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTask(TaskItem task);
}

