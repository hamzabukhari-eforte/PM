import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
  TrendingUp,
} from "lucide-react";
import type { DashboardKpi } from "@/lib/api/types";
import { kpiToneStyles } from "@/lib/dashboard-status";
import { cn } from "@/lib/utils";

const icons = {
  projects: FolderKanban,
  completed: CheckCircle2,
  active: TrendingUp,
  delayed: AlertTriangle,
};

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const Icon = icons[kpi.icon];
  const tone = kpiToneStyles[kpi.badge.tone];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tone.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium",
            tone.badge,
          )}
        >
          {kpi.badge.label}
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{kpi.label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-slate-900">
        {kpi.value}
      </p>
      <div className="mt-2 flex items-center gap-1 text-xs">
        {kpi.trend?.positive && (
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
        )}
        <span
          className={cn(
            kpi.trend?.positive ? "text-emerald-600" : "text-slate-500",
          )}
        >
          {kpi.subtext}
        </span>
      </div>
    </div>
  );
}
