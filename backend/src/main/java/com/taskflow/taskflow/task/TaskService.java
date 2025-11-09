package com.taskflow.taskflow.task;

import com.taskflow.taskflow.comment.CommentMapper;
import com.taskflow.taskflow.comment.TaskComment;
import com.taskflow.taskflow.comment.TaskCommentRepository;
import com.taskflow.taskflow.comment.dto.TaskCommentDto;
import com.taskflow.taskflow.project.Project;
import com.taskflow.taskflow.project.ProjectService;
import com.taskflow.taskflow.task.dto.CreateTaskRequest;
import com.taskflow.taskflow.task.dto.TaskDto;
import com.taskflow.taskflow.task.dto.UpdateTaskRequest;
import com.taskflow.taskflow.task.dto.UpdateTaskStatusRequest;
import com.taskflow.taskflow.user.UserAccount;
import com.taskflow.taskflow.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Use-case layer for task operations.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final ProjectService projectService;
    private final UserService userService;
    private final TaskCommentRepository commentRepository;
    private final CommentMapper commentMapper;

    public TaskService(TaskRepository taskRepository,
                       TaskMapper taskMapper,
                       ProjectService projectService,
                       UserService userService,
                       TaskCommentRepository commentRepository,
                       CommentMapper commentMapper) {
        // Wiring through constructor keeps collaborators explicit for tests.
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
        this.projectService = projectService;
        this.userService = userService;
        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
    }

    @Transactional
    public TaskDto createTask(Long projectId, CreateTaskRequest request) {
        // Ensure the parent project exists before creating the task.
        Project project = projectService.getProjectOrThrow(projectId);
        TaskItem task = TaskItem.builder()
                .project(project)
                .title(request.title())
                .description(request.description())
                .status(request.status())
                .dueDate(request.dueDate())
                .build();
        if (request.assigneeEmail() != null) {
            // Optional assignee lookup when provided by the client.
            UserAccount assignee = userService.getByEmail(request.assigneeEmail());
            task.setAssignee(assignee);
        }
        TaskItem saved = taskRepository.save(task);
        return taskMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskDto> listTasks(Long projectId) {
        // Load tasks for a project and map to lightweight DTOs for the API.
        Project project = projectService.getProjectOrThrow(projectId);
        return taskRepository.findByProject(project)
                .stream()
                .map(taskMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskItem getTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .map(task -> {
                    projectService.getProjectOrThrow(task.getProject().getId());
                    return task;
                })
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + id));
    }

    @Transactional
    public TaskDto updateStatus(Long taskId, UpdateTaskStatusRequest request) {
        // Only mutate the status field so partial updates stay safe.
        TaskItem task = getTaskOrThrow(taskId);
        task.setStatus(request.status());
        TaskItem saved = taskRepository.save(task);
        return taskMapper.toDto(saved);
    }

    @Transactional
    public TaskCommentDto addComment(Long taskId, String authorEmail, String body) {
        // Resolve both the task and author to maintain referential integrity.
        TaskItem task = getTaskOrThrow(taskId);
        UserAccount author = userService.getByEmail(authorEmail);
        TaskComment comment = TaskComment.builder()
                .task(task)
                .author(author)
                .body(body)
                .build();
        TaskComment saved = commentRepository.save(comment);
        return commentMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskCommentDto> listComments(Long taskId) {
        // Fetch all comments belonging to a task, newest first via repository.
        TaskItem task = getTaskOrThrow(taskId);
        return commentRepository.findByTask(task)
                .stream()
                .map(commentMapper::toDto)
                .toList();
    }

    @Transactional
    public TaskDto updateTask(Long taskId, UpdateTaskRequest request) {
        TaskItem task = getTaskOrThrow(taskId);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setDueDate(request.dueDate());
        if (request.assigneeEmail() != null && !request.assigneeEmail().isBlank()) {
            UserAccount assignee = userService.getByEmail(request.assigneeEmail());
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }
        TaskItem saved = taskRepository.save(task);
        return taskMapper.toDto(saved);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        TaskItem task = getTaskOrThrow(taskId);
        taskRepository.delete(task);
    }
}

