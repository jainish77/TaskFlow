package com.taskflow.taskflow.project;

import com.taskflow.taskflow.project.dto.CreateProjectRequest;
import com.taskflow.taskflow.project.dto.ProjectDto;
import com.taskflow.taskflow.project.dto.UpdateProjectRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for project operations.
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /**
     * Returns only the projects owned by the currently logged-in user.
     */
    @GetMapping
    public List<ProjectDto> getProjects() {
        return projectService.listMyProjects();
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody CreateProjectRequest request) {
        ProjectDto project = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    /**
     * Fetches a single project including its tasks.
     */
    @GetMapping("/{id}")
    public ProjectDto getProject(@PathVariable("id") Long id) {
        return projectService.getProjectDetails(id);
    }

    @PutMapping("/{id}")
    public ProjectDto updateProject(@PathVariable("id") Long id,
                                    @Valid @RequestBody UpdateProjectRequest request) {
        return projectService.updateProject(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable("id") Long id) {
        projectService.deleteProject(id);
    }
}

