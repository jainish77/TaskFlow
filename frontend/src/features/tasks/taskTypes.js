/**
 * Shared enums/types between UI modules. Mirrors backend `TaskStatus`.
 */
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["BACKLOG"] = "BACKLOG";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["DONE"] = "DONE";
})(TaskStatus || (TaskStatus = {}));
export const taskStatusLabels = {
    BACKLOG: "Backlog",
    IN_PROGRESS: "In Progress",
    DONE: "Done"
};
