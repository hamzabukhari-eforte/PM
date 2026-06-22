"use client";

import Link from "next/link";
import { Calendar, CheckSquare, Users } from "lucide-react";
import type { ActiveProjectSummary } from "@/lib/api/types";
import { BoardQuickLinkOutline } from "@/components/layout/board-quick-link";
import { statusLabels, statusStyles } from "@/lib/dashboard-status";
import { cn } from "@/lib/utils";

export function ActiveProjectCard({ project }: { project: ActiveProjectSummary }) {
  const styles = statusStyles[project.status];

  return (
    <div className="card-interactive rounded-2xl border border-slate-200/80 bg-white p-5">
      <Link href={`/projects/${project.projectId}/`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900">{project.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              styles.badge,
            )}
          >
            {statusLabels[project.status]}
          </span>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">Progress</span>
            <span className="font-semibold tabular-nums text-slate-700">{project.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full transition-all duration-500", styles.bar)}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckSquare className="h-3.5 w-3.5 shrink-0" />
            <span>
              {project.tasksCompleted}/{project.tasksTotal}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{project.teamSize}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{project.daysRemaining}d left</span>
          </div>
        </div>
      </Link>

      <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
        <BoardQuickLinkOutline projectId={project.projectId} />
      </div>
    </div>
  );
}
