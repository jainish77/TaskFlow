import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  addComment,
  createTask,
  deleteProject,
  deleteTask,
  getProject,
  getProjectTasks,
  getTaskComments,
  Project,
  Task,
  UpdateTaskPayload,
  updateProject,
  updateTask,
  updateTaskStatus
} from "../../api/projects";
import { TaskStatus, taskStatusLabels } from "../tasks/taskTypes";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

type TaskFormValues = {
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  assigneeEmail?: string;
};

/**
 * Inner component that loads comments lazily once the user expands the section.
 */
const TaskComments = ({ taskId }: { taskId: number }) => {
  const commentsQuery = useQuery({
    queryKey: ["task", taskId, "comments"],
    queryFn: () => getTaskComments(taskId)
  });

  if (commentsQuery.isLoading) return <p>Loading comments...</p>;
  if (commentsQuery.isError)
    return <p style={{ color: "crimson" }}>Could not load comments. Try refreshing.</p>;

  return (
    <div>
      {commentsQuery.data?.map((comment) => (
        <article className="comment" key={comment.id}>
          <strong>{comment.authorEmail}</strong>
          <p style={{ margin: "0.25rem 0" }}>{comment.body}</p>
          <small style={{ color: "#6b7280" }}>{dayjs(comment.createdAt).fromNow()}</small>
        </article>
      ))}
      {commentsQuery.data?.length === 0 && <p>No comments yet. Be the first!</p>}
    </div>
  );
};

const TaskCard = ({
  task,
  onChangeStatus,
  onAddComment,
  onEdit,
  onDelete,
  isEditing,
  isDeleting
}: {
  task: Task;
  onChangeStatus: (taskId: number, status: TaskStatus) => void;
  onAddComment: (taskId: number, body: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isEditing: boolean;
  isDeleting: boolean;
}) => {
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

  return (
    <article className="card task-card">
      <header>
        <div>
          <h3 style={{ marginBottom: "0.2rem" }}>{task.title}</h3>
          <span className={`status-chip status-${task.status}`}>{taskStatusLabels[task.status]}</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={() => onChangeStatus(task.id, nextStatus)}>
            Move to {taskStatusLabels[nextStatus]}
          </button>
          <button className="btn btn-secondary" onClick={() => onEdit(task)} disabled={isEditing}>
            {isEditing ? "Saving..." : "Edit"}
          </button>
          <button className="btn btn-secondary" onClick={() => onDelete(task)} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </header>
      <p style={{ color: "#4b5563" }}>{task.description ?? "No description"}</p>
      <p style={{ color: "#6b7280" }}>
        Due: {task.dueDate ? dayjs(task.dueDate).format("MMM D") : "Not set"} • Assignee:{" "}
        {task.assigneeEmail ?? "Unassigned"}
      </p>
      <div className="comment-box">
        <button className="btn btn-secondary" onClick={() => setShowComments((prev) => !prev)}>
          {showComments ? "Hide" : "Show"} comments ({task.comments.length})
        </button>
        {showComments && (
          <>
            <TaskComments taskId={task.id} />
            <form
              onSubmit={async (evt) => {
                evt.preventDefault();
                if (!commentText) return;
                await onAddComment(task.id, commentText);
                setCommentText("");
              }}
              style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}
            >
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
              />
              <button className="btn btn-primary" type="submit">
                Post
              </button>
            </form>
          </>
        )}
      </div>
    </article>
  );
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
    mutationFn: (values: TaskFormValues) => createTask(projectIdNumber, values),
    onSuccess: () => {
      // Refresh both the task list and project summary so stats stay in sync.
      queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      updateTaskStatus(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ taskId, body }: { taskId: number; body: string }) => addComment(taskId, { body }),
    onSuccess: (_, variables) => {
      // After posting, refresh that task's comments and the parent task list counts.
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string | null }) =>
      updateProject(projectIdNumber, payload),
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
    mutationFn: ({ taskId, payload }: { taskId: number; payload: UpdateTaskPayload }) =>
      updateTask(taskId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId, "comments"] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectIdNumber] });
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<TaskFormValues>({
    defaultValues: {
      status: TaskStatus.BACKLOG
    }
  });

  const onCreateTask = handleSubmit(async (values) => {
    // `mutateAsync` lets us await the mutation before resetting the form.
    await addTaskMutation.mutateAsync(values);
    reset({ title: "", description: "", dueDate: "", status: TaskStatus.BACKLOG, assigneeEmail: "" });
  });

  const handleEditProject = (project: Project) => {
    const nextName = window.prompt("Project name", project.name);
    if (nextName === null || !nextName.trim()) return;
    const nextDescription = window.prompt("Project description", project.description ?? "");
    const cleanedDescription = nextDescription?.trim();
    updateProjectMutation.mutate({
      name: nextName.trim(),
      description: cleanedDescription ? cleanedDescription : null
    });
  };

  const handleDeleteProject = (project: Project) => {
    const confirmed = window.confirm(`Delete project "${project.name}"? This cannot be undone.`);
    if (!confirmed) return;
    deleteProjectMutation.mutate();
  };

  const handleEditTask = (task: Task) => {
    const nextTitle = window.prompt("Task title", task.title);
    if (nextTitle === null || !nextTitle.trim()) return;
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

  const handleDeleteTask = (task: Task) => {
    const confirmed = window.confirm(`Delete task "${task.title}"? This cannot be undone.`);
    if (!confirmed) return;
    deleteTaskMutation.mutate(task.id);
  };

  if (projectQuery.isLoading || tasksQuery.isLoading) {
    return (
      <div className="card">
        <p>Loading project...</p>
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="card">
        <p style={{ color: "crimson" }}>Could not find that project. <Link to="/">Back to list</Link></p>
      </div>
    );
  }

  const project: Project = projectQuery.data;
  const tasks: Task[] = tasksQuery.data ?? [];

  return (
    <>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">← Back to projects</Link>
      </nav>
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <h2>{project.name}</h2>
            <p style={{ color: "#4b5563" }}>{project.description ?? "No description yet"}</p>
            <p style={{ color: "#6b7280" }}>
              Owner: {project.ownerEmail} • Created {dayjs(project.createdAt).fromNow()}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary" onClick={() => handleEditProject(project)} disabled={updateProjectMutation.isPending}>
              {updateProjectMutation.isPending ? "Saving..." : "Edit"}
            </button>
            <button className="btn btn-secondary" onClick={() => handleDeleteProject(project)} disabled={deleteProjectMutation.isPending}>
              {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        {(updateProjectMutation.isError || deleteProjectMutation.isError) && (
          <p style={{ color: "crimson", marginTop: "1rem" }}>
            Could not update this project. Please try again.
          </p>
        )}
      </section>

      <section className="card">
        <h3>Create task</h3>
        <form className="form-grid" onSubmit={onCreateTask}>
          <label>
            Title
            <input placeholder="Draft onboarding email" {...register("title", { required: true })} />
          </label>
          <label>
            Description
            <textarea {...register("description")} placeholder="Optional details" />
          </label>
          <label>
            Due date
            <input type="date" {...register("dueDate")} />
          </label>
          <label>
            Status
            <select {...register("status")}>
              {Object.values(TaskStatus).map((status) => (
                <option key={status} value={status}>
                  {taskStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Assignee email
            <input type="email" placeholder="member@taskflow.dev" {...register("assigneeEmail")} />
          </label>
          <button className="btn btn-primary" disabled={isSubmitting || addTaskMutation.isPending}>
            {addTaskMutation.isPending ? "Creating..." : "Add task"}
          </button>
          {addTaskMutation.isError && (
            <p style={{ color: "crimson" }}>Unable to create task. Make sure the assignee email exists.</p>
          )}
        </form>
      </section>

      <section>
        <h3 style={{ marginBottom: "1rem" }}>Tasks</h3>
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onChangeStatus={(taskId, status) => updateStatusMutation.mutate({ taskId, status })}
              onAddComment={async (taskId, body) => {
                await addCommentMutation.mutateAsync({ taskId, body });
              }}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              isEditing={updateTaskMutation.isPending && updateTaskMutation.variables?.taskId === task.id}
              isDeleting={deleteTaskMutation.isPending && deleteTaskMutation.variables === task.id}
            />
          ))}
          {tasks.length === 0 && <p>No tasks yet. Start by creating one above.</p>}
        </div>
        {(updateTaskMutation.isError || deleteTaskMutation.isError) && (
          <p style={{ color: "crimson", marginTop: "1rem" }}>Could not update this task. Please try again.</p>
        )}
      </section>
    </>
  );
};

