import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createProject, deleteProject, getProjects, Project, updateProject } from "../../api/projects";

/**
 * Component that:
 *  - Fetches projects via React Query
 *  - Shows a list of cards
 *  - Provides a minimal inline form to create a project
 */
export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate list so the new project shows up instantly.
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setName("");
      setDescription("");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; description?: string | null } }) =>
      updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!name) return;
    createMutation.mutate({ name, description });
  };

  const handleEditProject = (project: Project) => {
    const nextName = window.prompt("Project name", project.name);
    if (nextName === null || !nextName.trim()) return;
    const nextDescription = window.prompt("Project description", project.description ?? "");
    updateMutation.mutate({
      id: project.id,
      payload: { name: nextName.trim(), description: nextDescription?.trim() ? nextDescription : null }
    });
  };

  const handleDeleteProject = (project: Project) => {
    const confirmed = window.confirm(`Delete project "${project.name}"? This cannot be undone.`);
    if (!confirmed) return;
    deleteMutation.mutate(project.id);
  };

  const renderProject = (project: Project) => {
    const isUpdating = updateMutation.isPending && updateMutation.variables?.id === project.id;
    const isDeleting = deleteMutation.isPending && deleteMutation.variables === project.id;
    return (
      <div className="card" key={project.id}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ marginBottom: "0.3rem" }}>{project.name}</h2>
            <p style={{ margin: 0, color: "#6b7280" }}>{project.description ?? "No description yet"}</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link className="btn btn-secondary" to={`/projects/${project.id}`}>
              View
            </Link>
            <button className="btn btn-secondary" onClick={() => handleEditProject(project)} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Edit"}
            </button>
            <button className="btn btn-secondary" onClick={() => handleDeleteProject(project)} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </header>
        <p style={{ marginTop: "1rem", color: "#4b5563" }}>
          Tasks: <strong>{project.tasks?.length ?? 0}</strong> • Owner: {project.ownerEmail}
        </p>
      </div>
    );
  };

  return (
    <>
      <section className="card">
        <h2>Create a new project</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Marketing site" />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional summary"
            />
          </label>
          <button className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Create project"}
          </button>
        </form>
        {createMutation.isError && (
          <p style={{ color: "crimson" }}>Could not create project. Check server logs for details.</p>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: "1rem" }}>Your projects</h2>
        {projectsQuery.isLoading && <p>Loading...</p>}
        {projectsQuery.isError && (
          <p style={{ color: "crimson" }}>Failed to load projects. Double-check that the backend is running.</p>
        )}
        {(updateMutation.isError || deleteMutation.isError) && (
          <p style={{ color: "crimson" }}>Could not update this project. Please try again.</p>
        )}
        {projectsQuery.data?.length === 0 && <p>You have no projects yet. Create one above!</p>}
        <div>
          {projectsQuery.data?.map(renderProject)}
        </div>
      </section>
    </>
  );
};

