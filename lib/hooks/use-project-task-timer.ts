"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/api/types";
import { getLiveTimeInProgressSeconds } from "@/lib/utils/task-time";

/** Live ticking seconds for project tasks in progress; frozen total after review. */
export function useProjectTaskTimer(task: Task): number {
  const [tick, setTick] = useState(0);

  const isLive =
    task.kind === "project" &&
    task.status === "in_progress" &&
    !!task.inProgressSince;

  useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [isLive, task.inProgressSince]);

  void tick;
  return getLiveTimeInProgressSeconds(task);
}

export function shouldShowProjectTaskTimer(task: Task): boolean {
  if (task.kind !== "project") return false;
  if (task.status === "in_progress") return true;
  if (task.status === "review" && task.timeInProgressSeconds > 0) return true;
  return task.timeInProgressSeconds > 0 && task.status !== "todo";
}
