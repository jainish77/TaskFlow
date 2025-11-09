import { api } from "./client";
import { TaskStatus } from "../features/tasks/taskTypes";

export type TaskComment = {
  id: number;
  body: string;
  authorEmail: string;
  createdAt: string;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  assigneeEmail: string | null;
  createdAt: string;
  updatedAt: string;
  comments: TaskComment[];
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  ownerEmail: string;
  createdAt: string;
  tasks: Task[];
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
};

export type UpdateProjectPayload = {
  name: string;
  description?: string | null;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  assigneeEmail?: string;
};

export type UpdateTaskPayload = {
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  assigneeEmail?: string | null;
};

export type UpdateTaskStatusPayload = {
  status: TaskStatus;
};

export type CreateCommentPayload = {
  body: string;
};

// Load every project owned by the current user.
export const getProjects = async () => {
  const { data } = await api.get<Project[]>("/projects");
  return data;
};

// Create a project then return the saved record with generated id.
export const createProject = async (payload: CreateProjectPayload) => {
  const { data } = await api.post<Project>("/projects", payload);
  return data;
};

export const updateProject = async (id: number, payload: UpdateProjectPayload) => {
  const { data } = await api.put<Project>(`/projects/${id}`, payload);
  return data;
};

export const deleteProject = async (id: number) => {
  await api.delete(`/projects/${id}`);
};

// Fetch a single project including its nested tasks.
export const getProject = async (id: number) => {
  const { data } = await api.get<Project>(`/projects/${id}`);
  return data;
};

// Convenience getter used by the detail page to fetch tasks separately.
export const getProjectTasks = async (projectId: number) => {
  const { data } = await api.get<Task[]>(`/projects/${projectId}/tasks`);
  return data;
};

// Save a new task associated with the given project.
export const createTask = async (projectId: number, payload: CreateTaskPayload) => {
  const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, payload);
  return data;
};

export const updateTask = async (taskId: number, payload: UpdateTaskPayload) => {
  const { data } = await api.put<Task>(`/tasks/${taskId}`, payload);
  return data;
};

// Update just the status field to keep backend logic simple.
export const updateTaskStatus = async (taskId: number, payload: UpdateTaskStatusPayload) => {
  const { data } = await api.patch<Task>(`/tasks/${taskId}/status`, payload);
  return data;
};

// Retrieve comments for a task; used when the user expands the comment section.
export const getTaskComments = async (taskId: number) => {
  const { data } = await api.get<TaskComment[]>(`/tasks/${taskId}/comments`);
  return data;
};

// Post a comment to the backend and return the saved comment DTO.
export const addComment = async (taskId: number, payload: CreateCommentPayload) => {
  const { data } = await api.post<TaskComment>(`/tasks/${taskId}/comments`, payload);
  return data;
};

export const deleteTask = async (taskId: number) => {
  await api.delete(`/tasks/${taskId}`);
};

