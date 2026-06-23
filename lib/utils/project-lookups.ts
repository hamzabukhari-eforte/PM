import type { PlanTask } from "@/lib/api/types";

export function lookupLabel(
  options: { id: string; label: string }[] | undefined,
  id: string | null | undefined,
) {
  if (!id || !options) return null;
  return options.find((o) => o.id === id)?.label ?? null;
}

export function countPlanTasks(nodes: PlanTask[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countPlanTasks(n.subtasks ?? []), 0);
}
