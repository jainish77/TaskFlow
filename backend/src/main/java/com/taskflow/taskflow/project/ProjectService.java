package com.taskflow.taskflow.project;

import com.taskflow.taskflow.common.SecurityUtils;
import com.taskflow.taskflow.project.dto.CreateProjectRequest;
import com.taskflow.taskflow.project.dto.ProjectDto;
import com.taskflow.taskflow.project.dto.UpdateProjectRequest;
import com.taskflow.taskflow.task.TaskRepository;
import com.taskflow.taskflow.user.UserAccount;
import com.taskflow.taskflow.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Handles project-related business rules.
 */
@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;
    private final ProjectMapper projectMapper;

    public ProjectService(ProjectRepository projectRepository,
                          TaskRepository taskRepository,
                          UserService userService,
                          ProjectMapper projectMapper) {
        // Constructor injection keeps collaboration explicit for testing.
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userService = userService;
        this.projectMapper = projectMapper;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> listMyProjects() {
        // Fetch every project owned by the currently authenticated user.
        String email = SecurityUtils.currentUserEmail();
        return projectRepository.findByOwnerEmailIgnoreCase(email)
                .stream()
                .map(projectMapper::toDto)
                .toList();
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request) {
        String email = SecurityUtils.currentUserEmail();
        UserAccount owner = userService.getByEmail(email);
        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .owner(owner)
                .build();
        // Saving runs inside the transaction so the generated ID is available to return.
        Project saved = projectRepository.save(project);
        return projectMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public Project getProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .filter(this::isOwnedByCurrentUser)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectDetails(Long id) {
        Project project = getProjectOrThrow(id);
        return projectMapper.toDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long id, UpdateProjectRequest request) {
        Project project = getProjectOrThrow(id);
        project.setName(request.name());
        project.setDescription(request.description());
        Project saved = projectRepository.save(project);
        return projectMapper.toDto(saved);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = getProjectOrThrow(id);
        projectRepository.delete(project);
    }

    private boolean isOwnedByCurrentUser(Project project) {
        String currentEmail = SecurityUtils.currentUserEmail();
        return project.getOwner() != null && project.getOwner().getEmail().equalsIgnoreCase(currentEmail);
    }
}

