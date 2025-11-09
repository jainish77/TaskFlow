package com.taskflow.taskflow.task;

import com.taskflow.taskflow.comment.dto.CreateCommentRequest;
import com.taskflow.taskflow.comment.dto.TaskCommentDto;
import com.taskflow.taskflow.common.SecurityUtils;
import com.taskflow.taskflow.task.dto.CreateTaskRequest;
import com.taskflow.taskflow.task.dto.TaskDto;
import com.taskflow.taskflow.task.dto.UpdateTaskRequest;
import com.taskflow.taskflow.task.dto.UpdateTaskStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints under `/api/projects/{projectId}/tasks` and `/api/tasks` for additional operations.
 */
@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/projects/{projectId}/tasks")
    public List<TaskDto> list(@PathVariable("projectId") Long projectId) {
        return taskService.listTasks(projectId);
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskDto> create(@PathVariable("projectId") Long projectId,
                                          @Valid @RequestBody CreateTaskRequest request) {
        // Delegates to the service which handles validation and persistence.
        TaskDto task = taskService.createTask(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PatchMapping("/tasks/{taskId}/status")
    public TaskDto updateStatus(@PathVariable("taskId") Long taskId,
                                @Valid @RequestBody UpdateTaskStatusRequest request) {
        return taskService.updateStatus(taskId, request);
    }

    @PutMapping("/tasks/{taskId}")
    public TaskDto updateTask(@PathVariable("taskId") Long taskId,
                              @Valid @RequestBody UpdateTaskRequest request) {
        return taskService.updateTask(taskId, request);
    }

    @DeleteMapping("/tasks/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable("taskId") Long taskId) {
        taskService.deleteTask(taskId);
    }

    @GetMapping("/tasks/{taskId}/comments")
    public List<TaskCommentDto> comments(@PathVariable("taskId") Long taskId) {
        return taskService.listComments(taskId);
    }

    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<TaskCommentDto> addComment(@PathVariable("taskId") Long taskId,
                                                     @Valid @RequestBody CreateCommentRequest request) {
        // Server-side sets author from the JWT instead of trusting the client payload.
        String authorEmail = SecurityUtils.currentUserEmail();
        TaskCommentDto comment = taskService.addComment(taskId, authorEmail, request.body());
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }
}

