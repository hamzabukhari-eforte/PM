import type { Task, TaskStatus } from "@/lib/api/types";

/** Accumulate active time when leaving in_progress (project tasks only, until review). */
export function applyStatusTimeTracking(
  task: Task,
  nextStatus: TaskStatus,
  now = new Date(),
): Pick<Task, "timeInProgressSeconds" | "inProgressSince"> {
  if (task.kind !== "project") {
    return {
      timeInProgressSeconds: 0,
      inProgressSince: null,
    };
  }

  const iso = now.toISOString();

  if (nextStatus === "in_progress" && task.status !== "in_progress") {
    return {
      timeInProgressSeconds: task.timeInProgressSeconds,
      inProgressSince: iso,
    };
  }

  if (task.status === "in_progress" && nextStatus !== "in_progress") {
    const elapsed = task.inProgressSince
      ? Math.max(0, Math.floor((now.getTime() - new Date(task.inProgressSince).getTime()) / 1000))
      : 0;
    return {
      timeInProgressSeconds: task.timeInProgressSeconds + elapsed,
      inProgressSince: null,
    };
  }

  return {
    timeInProgressSeconds: task.timeInProgressSeconds,
    inProgressSince: task.inProgressSince,
  };
}

export function getLiveTimeInProgressSeconds(task: Task, now = new Date()): number {
  if (task.kind !== "project") return 0;
  if (task.status !== "in_progress" || !task.inProgressSince) {
    return task.timeInProgressSeconds;
  }
  const elapsed = Math.max(
    0,
    Math.floor((now.getTime() - new Date(task.inProgressSince).getTime()) / 1000),
  );
  return task.timeInProgressSeconds + elapsed;
}
