import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { addComment, createTask, deleteProject, deleteTask, getProject, getProjectTasks, getTaskComments, updateProject, updateTask, updateTaskStatus } from "../../api/projects";
import { TaskStatus, taskStatusLabels } from "../tasks/taskTypes";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
dayjs.extend(relativeTime);
/**
 * Inner component that loads comments lazily once the user expands the section.
 */
const TaskComments = ({ taskId }) => {
    const commentsQuery = useQuery({
        queryKey: ["task", taskId, "comments"],
        queryFn: () => getTaskComments(taskId)
    });
    if (commentsQuery.isLoading)
        return _jsx("p", { children: "Loading comments..." });
    if (commentsQuery.isError)
        return _jsx("p", { style: { color: "crimson" }, children: "Could not load comments. Try refreshing." });
    return (_jsxs("div", { children: [commentsQuery.data?.map((comment) => (_jsxs("article", { className: "comment", children: [_jsx("strong", { children: comment.authorEmail }), _jsx("p", { style: { margin: "0.25rem 0" }, children: comment.body }), _jsx("small", { style: { color: "#6b7280" }, children: dayjs(comment.createdAt).fromNow() })] }, comment.id))), commentsQuery.data?.length === 0 && _jsx("p", { children: "No comments yet. Be the first!" })] }));
};
const TaskCard = ({ task, onChangeStatus, onAddComment, onEdit, onDelete, isEditing, isDeleting }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const nextStatus = useMemo(() => {
        // Cycle status forward in a simple backlog → in progress → done rotation.
        switch (task.status) {
            case TaskStatus.BACKLOG:
                return TaskStatus.IN_PROGRESS;
            case TaskStatus.IN_PROGRESS:
                return TaskStatus.DONE;
            case TaskStatus.DONE:
                return TaskStatus.BACKLOG;
            default:
                return TaskStatus.BACKLOG;
        }
    }, [task.status]);
    return (_jsxs("article", { className: "card task-card", children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("h3", { style: { marginBottom: "0.2rem" }, children: task.title }), _jsx("span", { className: `status-chip status-${task.status}`, children: taskStatusLabels[task.status] })] }), _jsxs("div", { style: { display: "flex", gap: "0.5rem" }, children: [_jsxs("button", { className: "btn btn-secondary", onClick: () => onChangeStatus(task.id, nextStatus), children: ["Move to ", taskStatusLabels[nextStatus]] }), _jsx("button", { className: "btn btn-secondary", onClick: () => onEdit(task), disabled: isEditing, children: isEditing ? "Saving..." : "Edit" }), _jsx("button", { className: "btn btn-secondary", onClick: () => onDelete(task), disabled: isDeleting, children: isDeleting ? "Deleting..." : "Delete" })] })] }), _jsx("p", { style: { color: "#4b5563" }, children: task.description ?? "No description" }), _jsxs("p", { style: { color: "#6b7280" }, children: ["Due: ", task.dueDate ? dayjs(task.dueDate).format("MMM D") : "Not set", " \u2022 Assignee:", " ", task.assigneeEmail ?? "Unassigned"] }), _jsxs("div", { className: "comment-box", children: [_jsxs("button", { className: "btn btn-secondary", onClick: () => setShowComments((prev) => !prev), children: [showComments ? "Hide" : "Show", " comments (", task.comments.length, ")"] }), showComments && (_jsxs(_Fragment, { children: [_jsx(TaskComments, { taskId: task.id }), _jsxs("form", { onSubmit: async (evt) => {
                                    evt.preventDefault();
                                    if (!commentText)
                                        return;
                                    await onAddComment(task.id, commentText);
                                    setCommentText("");
                                }, style: { marginTop: "1rem", display: "flex", gap: "0.75rem" }, children: [_jsx("input", { value: commentText, onChange: (e) => setCommentText(e.target.value), placeholder: "Add a comment..." }), _jsx("button", { className: "btn btn-primary", type: "submit", children: "Post" })] })] }))] })] }));
};
export const ProjectDetailPage = () => {
    const { projectId } = useParams();
    const projectIdNumber = Number(projectId);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const projectQuery = useQuery({
        queryKey: ["project", projectIdNumber],
        queryFn: () => getProject(projectIdNumber),
        // Skip the request entirely if projectId was not present in the URL.
        enabled: Number.isFinite(projectIdNumber)
    });
    const tasksQuery = useQuery({
        queryKey: ["project", projectIdNumber, "tasks"],
        queryFn: () => getProjectTasks(projectIdNumber),
        enabled: Number.isFinite(projectIdNumber)
    });
    const addTaskMutation = useMutation({
        mutationFn: (values) => createTask(projectIdNumber, values),
        onSuccess: () => {
            // Refresh both the task list and project summary so stats stay in sync.
            queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
            queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
    });
    const updateStatusMutation = useMutation({
        mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
        }
    });
    const addCommentMutation = useMutation({
        mutationFn: ({ taskId, body }) => addComment(taskId, { body }),
        onSuccess: (_, variables) => {
            // After posting, refresh that task's comments and the parent task list counts.
            queryClient.invalidateQueries({ queryKey: ["task", variables.taskId, "comments"] });
            queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
        }
    });
    const updateProjectMutation = useMutation({
        mutationFn: (payload) => updateProject(projectIdNumber, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
    });
    const deleteProjectMutation = useMutation({
        mutationFn: () => deleteProject(projectIdNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            navigate("/");
        }
    });
    const updateTaskMutation = useMutation({
        mutationFn: ({ taskId, payload }) => updateTask(taskId, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
            queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber] });
            queryClient.invalidateQueries({ queryKey: ["task", variables.taskId, "comments"] });
        }
    });
    const deleteTaskMutation = useMutation({
        mutationFn: (taskId) => deleteTask(taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
            queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber] });
        }
    });
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
        defaultValues: {
            status: TaskStatus.BACKLOG
        }
    });
    const onCreateTask = handleSubmit(async (values) => {
        // `mutateAsync` lets us await the mutation before resetting the form.
        await addTaskMutation.mutateAsync(values);
        reset({ title: "", description: "", dueDate: "", status: TaskStatus.BACKLOG, assigneeEmail: "" });
    });
    const handleEditProject = (project) => {
        const nextName = window.prompt("Project name", project.name);
        if (nextName === null || !nextName.trim())
            return;
        const nextDescription = window.prompt("Project description", project.description ?? "");
        const cleanedDescription = nextDescription?.trim();
        updateProjectMutation.mutate({
            name: nextName.trim(),
            description: cleanedDescription ? cleanedDescription : null
        });
    };
    const handleDeleteProject = (project) => {
        const confirmed = window.confirm(`Delete project "${project.name}"? This cannot be undone.`);
        if (!confirmed)
            return;
        deleteProjectMutation.mutate();
    };
    const handleEditTask = (task) => {
        const nextTitle = window.prompt("Task title", task.title);
        if (nextTitle === null || !nextTitle.trim())
            return;
        const nextDescription = window.prompt("Task description", task.description ?? "");
        const nextDueDate = window.prompt("Due date (YYYY-MM-DD)", task.dueDate ?? "");
        const nextAssignee = window.prompt("Assignee email (leave blank to unassign)", task.assigneeEmail ?? "");
        const cleanedDescription = nextDescription?.trim();
        const cleanedDueDate = nextDueDate?.trim();
        const cleanedAssignee = nextAssignee?.trim();
        updateTaskMutation.mutate({
            taskId: task.id,
            payload: {
                title: nextTitle.trim(),
                description: cleanedDescription ? cleanedDescription : null,
                status: task.status,
                dueDate: cleanedDueDate ? cleanedDueDate : null,
                assigneeEmail: cleanedAssignee ? cleanedAssignee : null
            }
        });
    };
    const handleDeleteTask = (task) => {
        const confirmed = window.confirm(`Delete task "${task.title}"? This cannot be undone.`);
        if (!confirmed)
            return;
        deleteTaskMutation.mutate(task.id);
    };
    if (projectQuery.isLoading || tasksQuery.isLoading) {
        return (_jsx("div", { className: "card", children: _jsx("p", { children: "Loading project..." }) }));
    }
    if (projectQuery.isError || !projectQuery.data) {
        return (_jsx("div", { className: "card", children: _jsxs("p", { style: { color: "crimson" }, children: ["Could not find that project. ", _jsx(Link, { to: "/", children: "Back to list" })] }) }));
    }
    const project = projectQuery.data;
    const tasks = tasksQuery.data ?? [];
    return (_jsxs(_Fragment, { children: [_jsx("nav", { style: { marginBottom: "1rem" }, children: _jsx(Link, { to: "/", children: "\u2190 Back to projects" }) }), _jsxs("section", { className: "card", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }, children: [_jsxs("div", { children: [_jsx("h2", { children: project.name }), _jsx("p", { style: { color: "#4b5563" }, children: project.description ?? "No description yet" }), _jsxs("p", { style: { color: "#6b7280" }, children: ["Owner: ", project.ownerEmail, " \u2022 Created ", dayjs(project.createdAt).fromNow()] })] }), _jsxs("div", { style: { display: "flex", gap: "0.5rem" }, children: [_jsx("button", { className: "btn btn-secondary", onClick: () => handleEditProject(project), disabled: updateProjectMutation.isPending, children: updateProjectMutation.isPending ? "Saving..." : "Edit" }), _jsx("button", { className: "btn btn-secondary", onClick: () => handleDeleteProject(project), disabled: deleteProjectMutation.isPending, children: deleteProjectMutation.isPending ? "Deleting..." : "Delete" })] })] }), (updateProjectMutation.isError || deleteProjectMutation.isError) && (_jsx("p", { style: { color: "crimson", marginTop: "1rem" }, children: "Could not update this project. Please try again." }))] }), _jsxs("section", { className: "card", children: [_jsx("h3", { children: "Create task" }), _jsxs("form", { className: "form-grid", onSubmit: onCreateTask, children: [_jsxs("label", { children: ["Title", _jsx("input", { placeholder: "Draft onboarding email", ...register("title", { required: true }) })] }), _jsxs("label", { children: ["Description", _jsx("textarea", { ...register("description"), placeholder: "Optional details" })] }), _jsxs("label", { children: ["Due date", _jsx("input", { type: "date", ...register("dueDate") })] }), _jsxs("label", { children: ["Status", _jsx("select", { ...register("status"), children: Object.values(TaskStatus).map((status) => (_jsx("option", { value: status, children: taskStatusLabels[status] }, status))) })] }), _jsxs("label", { children: ["Assignee email", _jsx("input", { type: "email", placeholder: "member@taskflow.dev", ...register("assigneeEmail") })] }), _jsx("button", { className: "btn btn-primary", disabled: isSubmitting || addTaskMutation.isPending, children: addTaskMutation.isPending ? "Creating..." : "Add task" }), addTaskMutation.isError && (_jsx("p", { style: { color: "crimson" }, children: "Unable to create task. Make sure the assignee email exists." }))] })] }), _jsxs("section", { children: [_jsx("h3", { style: { marginBottom: "1rem" }, children: "Tasks" }), _jsxs("div", { className: "task-list", children: [tasks.map((task) => (_jsx(TaskCard, { task: task, onChangeStatus: (taskId, status) => updateStatusMutation.mutate({ taskId, status }), onAddComment: async (taskId, body) => {
                                    await addCommentMutation.mutateAsync({ taskId, body });
                                }, onEdit: handleEditTask, onDelete: handleDeleteTask, isEditing: updateTaskMutation.isPending && updateTaskMutation.variables?.taskId === task.id, isDeleting: deleteTaskMutation.isPending && deleteTaskMutation.variables === task.id }, task.id))), tasks.length === 0 && _jsx("p", { children: "No tasks yet. Start by creating one above." })] }), (updateTaskMutation.isError || deleteTaskMutation.isError) && (_jsx("p", { style: { color: "crimson", marginTop: "1rem" }, children: "Could not update this task. Please try again." }))] })] }));
};
