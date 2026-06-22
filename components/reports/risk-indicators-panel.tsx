import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { RiskIndicator } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const severityStyles = {
  low: {
    border: "border-emerald-200 bg-emerald-50/80",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    title: "text-emerald-900",
    detail: "text-emerald-800/80",
  },
  medium: {
    border: "border-amber-200 bg-amber-50/80",
    icon: Info,
    iconClass: "text-amber-600",
    title: "text-amber-900",
    detail: "text-amber-800/80",
  },
  high: {
    border: "border-red-200 bg-red-50/80",
    icon: AlertTriangle,
    iconClass: "text-red-600",
    title: "text-red-900",
    detail: "text-red-800/80",
  },
};

export function RiskIndicatorsPanel({ risks }: { risks: RiskIndicator[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {risks.map((risk) => {
        const style = severityStyles[risk.severity];
        const Icon = style.icon;
        return (
          <div
            key={risk.id}
            className={cn("flex gap-3 rounded-xl border p-4", style.border)}
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.iconClass)} />
            <div>
              <p className={cn("text-sm font-semibold", style.title)}>{risk.title}</p>
              <p className={cn("mt-1 text-sm", style.detail)}>{risk.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
