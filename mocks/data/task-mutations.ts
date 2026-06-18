import type { Task, TaskStatus, UpdateTaskInput } from "@/lib/api/types";
import { nextReminderAt } from "@/lib/utils/routine";
import { applyStatusTimeTracking } from "@/lib/utils/task-time";
import { statusFromColumnId } from "./task-factory";

export function resolveNextStatus(
  task: Task,
  body: UpdateTaskInput,
): TaskStatus {
  if (body.status) return body.status;
  if (body.columnId) return statusFromColumnId(body.columnId);
  return task.status;
}

export function mergeTaskUpdate(task: Task, body: UpdateTaskInput): Task {
  const nextStatus = resolveNextStatus(task, body);
  const timeFields = applyStatusTimeTracking(task, nextStatus);

  const updated: Task = {
    ...task,
    ...body,
    ...timeFields,
    status: nextStatus,
    columnId: body.columnId !== undefined ? body.columnId : task.columnId,
    subtasks: body.subtasks !== undefined ? body.subtasks : task.subtasks,
  };

  if (
    task.kind === "routine" &&
    body.status === "done" &&
    task.recurrenceInterval
  ) {
    updated.status = "todo";
    updated.nextReminderAt = nextReminderAt(task.recurrenceInterval);
    updated.timeInProgressSeconds = 0;
    updated.inProgressSince = null;
  }

  return updated;
}
