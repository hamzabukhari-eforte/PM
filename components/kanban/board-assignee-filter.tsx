"use client";

import { cn } from "@/lib/utils";
import type { ProjectMember } from "@/lib/api/types";

export type AssigneeFilter = "all" | "me" | string;

export function BoardAssigneeFilter({
  members,
  currentUserId,
  value,
  onChange,
}: {
  members: ProjectMember[];
  currentUserId?: string;
  value: AssigneeFilter;
  onChange: (value: AssigneeFilter) => void;
}) {
  const chips: { id: AssigneeFilter; label: string }[] = [
    { id: "all", label: "All members" },
    ...(currentUserId ? [{ id: "me" as const, label: "Assigned to me" }] : []),
    ...members.map((m) => ({ id: m.userId, label: m.name })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Assignee
      </span>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              value === chip.id
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { matchesAssigneeFilter } from "@/lib/utils/task-assignees";
