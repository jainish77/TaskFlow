/**
 * Shared enums/types between UI modules. Mirrors backend `TaskStatus`.
 */
export enum TaskStatus {
  BACKLOG = "BACKLOG",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE"
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  DONE: "Done"
};

