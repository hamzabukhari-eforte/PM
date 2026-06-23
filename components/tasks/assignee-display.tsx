"use client";

import { cn } from "@/lib/utils";
import { formatAssigneeNames } from "@/lib/utils/task-assignees";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AssigneeDisplay({
  names,
  className,
  compact = false,
}: {
  names: string[];
  className?: string;
  compact?: boolean;
}) {
  if (names.length === 0) {
    return <span className={cn("text-xs text-slate-400", className)}>Unassigned</span>;
  }

  const visible = names.slice(0, compact ? 2 : 3);
  const overflow = names.length - visible.length;

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <div className="flex -space-x-1.5">
        {visible.map((name) => (
          <span
            key={name}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-600"
            title={name}
          >
            {initials(name)}
          </span>
        ))}
        {overflow > 0 && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[9px] font-semibold text-indigo-700">
            +{overflow}
          </span>
        )}
      </div>
      {!compact && (
        <span className="truncate text-xs text-slate-500">{formatAssigneeNames(names)}</span>
      )}
    </div>
  );
}
