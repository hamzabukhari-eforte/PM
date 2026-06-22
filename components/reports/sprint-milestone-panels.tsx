import { Flag } from "lucide-react";
import type { MilestoneProgressPoint, SprintHealthPoint } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SprintHealthPanel({ sprints }: { sprints: SprintHealthPoint[] }) {
  if (sprints.length === 0) {
    return <p className="text-sm text-muted-foreground">No sprints for this project yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sprints.map((s) => (
        <div key={s.sprintId} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-slate-900">{s.sprintName}</p>
            <Badge
              variant={s.status === "active" ? "default" : s.status === "closed" ? "secondary" : "outline"}
            >
              {s.status}
            </Badge>
          </div>
          <div className="mb-1.5 flex justify-between text-xs text-slate-500">
            <span>
              {s.tasksDone}/{s.tasksTotal} tasks · {s.storyPointsDone}/{s.storyPointsTotal} pts
            </span>
            <span className="font-semibold tabular-nums text-slate-700">{s.progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                s.progressPercent >= 70
                  ? "bg-emerald-500"
                  : s.progressPercent >= 40
                    ? "bg-indigo-500"
                    : "bg-amber-500",
              )}
              style={{ width: `${s.progressPercent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MilestoneProgressPanel({ milestones }: { milestones: MilestoneProgressPoint[] }) {
  if (milestones.length === 0) {
    return <p className="text-sm text-muted-foreground">No plan milestones defined yet.</p>;
  }

  return (
    <div className="space-y-3">
      {milestones.map((m) => (
        <div key={m.code} className="rounded-lg border border-slate-100 px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                <span className="font-mono text-xs text-indigo-600">{m.code}</span>
                {m.title}
                {m.isMilestone && <Flag className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
              </p>
              {m.dueDate && (
                <p className="mt-0.5 text-xs text-slate-500">Due {m.dueDate.slice(0, 10)}</p>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
              {m.percent}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${m.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
