import { api } from "./client";
// Load every project owned by the current user.
export const getProjects = async () => {
    const { data } = await api.get("/projects");
    return data;
};
// Create a project then return the saved record with generated id.
export const createProject = async (payload) => {
    const { data } = await api.post("/projects", payload);
    return data;
};
export const updateProject = async (id, payload) => {
    const { data } = await api.put(`/projects/${id}`, payload);
    return data;
};
export const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
};
// Fetch a single project including its nested tasks.
export const getProject = async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
};
// Convenience getter used by the detail page to fetch tasks separately.
export const getProjectTasks = async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/tasks`);
    return data;
};
// Save a new task associated with the given project.
export const createTask = async (projectId, payload) => {
    const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
    return data;
};
export const updateTask = async (taskId, payload) => {
    const { data } = await api.put(`/tasks/${taskId}`, payload);
    return data;
};
// Update just the status field to keep backend logic simple.
export const updateTaskStatus = async (taskId, payload) => {
    const { data } = await api.patch(`/tasks/${taskId}/status`, payload);
    return data;
};
// Retrieve comments for a task; used when the user expands the comment section.
export const getTaskComments = async (taskId) => {
    const { data } = await api.get(`/tasks/${taskId}/comments`);
    return data;
};
// Post a comment to the backend and return the saved comment DTO.
export const addComment = async (taskId, payload) => {
    const { data } = await api.post(`/tasks/${taskId}/comments`, payload);
    return data;
};
export const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
};
