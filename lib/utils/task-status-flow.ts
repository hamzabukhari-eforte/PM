import type { TaskStatus } from "@/lib/api/types";

/** Kanban column order for project tasks. */
export const PROJECT_STATUS_FLOW: TaskStatus[] = [
  "todo",
  "in_progress",
  "review",
  "done",
];

export function statusFromColumnId(columnId: string): TaskStatus {
  if (columnId.includes("done")) return "done";
  if (columnId.includes("progress")) return "in_progress";
  if (columnId.includes("review")) return "review";
  return "todo";
}

export function isValidProjectStatusTransition(
  from: TaskStatus,
  to: TaskStatus,
): boolean {
  if (from === to) return true;
  const fromIdx = PROJECT_STATUS_FLOW.indexOf(from);
  const toIdx = PROJECT_STATUS_FLOW.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return Math.abs(toIdx - fromIdx) === 1;
}

/** Allows reorder within a column, or a single step to an adjacent column. */
export function canMoveTaskToColumn(
  fromColumnId: string,
  toColumnId: string,
): boolean {
  if (fromColumnId === toColumnId) return true;
  return isValidProjectStatusTransition(
    statusFromColumnId(fromColumnId),
    statusFromColumnId(toColumnId),
  );
}

export function statusFlowLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "Review",
    done: "Done",
  };
  return labels[status];
}
