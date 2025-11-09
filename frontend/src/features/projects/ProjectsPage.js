import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createProject, getProjects } from "../../api/projects";
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
    const handleSubmit = (evt) => {
        evt.preventDefault();
        if (!name)
            return;
        createMutation.mutate({ name, description });
    };
    const renderProject = (project) => (_jsxs("div", { className: "card", children: [_jsxs("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { children: [_jsx("h2", { style: { marginBottom: "0.3rem" }, children: project.name }), _jsx("p", { style: { margin: 0, color: "#6b7280" }, children: project.description ?? "No description yet" })] }), _jsx(Link, { className: "btn btn-secondary", to: `/projects/${project.id}`, children: "View" })] }), _jsxs("p", { style: { marginTop: "1rem", color: "#4b5563" }, children: ["Tasks: ", _jsx("strong", { children: project.tasks?.length ?? 0 }), " \u2022 Owner: ", project.ownerEmail] })] }, project.id));
    return (_jsxs(_Fragment, { children: [_jsxs("section", { className: "card", children: [_jsx("h2", { children: "Create a new project" }), _jsxs("form", { className: "form-grid", onSubmit: handleSubmit, children: [_jsxs("label", { children: ["Name", _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Marketing site" })] }), _jsxs("label", { children: ["Description", _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Optional summary" })] }), _jsx("button", { className: "btn btn-primary", disabled: createMutation.isPending, children: createMutation.isPending ? "Saving..." : "Create project" })] }), createMutation.isError && (_jsx("p", { style: { color: "crimson" }, children: "Could not create project. Check server logs for details." }))] }), _jsxs("section", { children: [_jsx("h2", { style: { marginBottom: "1rem" }, children: "Your projects" }), projectsQuery.isLoading && _jsx("p", { children: "Loading..." }), projectsQuery.isError && (_jsx("p", { style: { color: "crimson" }, children: "Failed to load projects. Double-check that the backend is running." })), projectsQuery.data?.length === 0 && _jsx("p", { children: "You have no projects yet. Create one above!" }), _jsx("div", { children: projectsQuery.data?.map(renderProject) })] })] }));
};
