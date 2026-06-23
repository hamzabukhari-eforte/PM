import type { TaskStatus } from "@/lib/api/types";

export const personalTaskStatusFlow: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export const personalTaskStatusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  review: "Review",
  done: "Done",
};
