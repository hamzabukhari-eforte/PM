import type { ProjectReportKpi } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const toneStyles: Record<
  ProjectReportKpi["tone"],
  { ring: string; value: string; bg: string }
> = {
  blue: { ring: "border-indigo-100", value: "text-indigo-700", bg: "bg-indigo-50" },
  green: { ring: "border-emerald-100", value: "text-emerald-700", bg: "bg-emerald-50" },
  orange: { ring: "border-amber-100", value: "text-amber-700", bg: "bg-amber-50" },
  red: { ring: "border-red-100", value: "text-red-700", bg: "bg-red-50" },
  slate: { ring: "border-slate-200", value: "text-slate-800", bg: "bg-slate-50" },
  violet: { ring: "border-violet-100", value: "text-violet-700", bg: "bg-violet-50" },
};

export function ProjectReportKpiGrid({ kpis }: { kpis: ProjectReportKpi[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const tone = toneStyles[kpi.tone];
        return (
          <div
            key={kpi.id}
            className={cn(
              "rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
              tone.ring,
            )}
          >
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <p className={cn("mt-2 text-3xl font-bold tabular-nums tracking-tight", tone.value)}>
              {kpi.value}
            </p>
            {kpi.subtext && (
              <p className={cn("mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs", tone.bg, tone.value)}>
                {kpi.subtext}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
