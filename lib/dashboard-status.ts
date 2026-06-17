import type { ProjectHealthStatus } from "@/lib/api/types";

export const statusLabels: Record<ProjectHealthStatus, string> = {
  active: "Active",
  on_track: "On Track",
  in_progress: "In Progress",
  on_hold: "On Hold",
  at_risk: "At Risk",
};

export const statusStyles: Record<
  ProjectHealthStatus,
  { badge: string; bar: string }
> = {
  active: {
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    bar: "bg-blue-500",
  },
  on_track: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    bar: "bg-emerald-500",
  },
  in_progress: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    bar: "bg-amber-500",
  },
  on_hold: {
    badge: "bg-yellow-50 text-yellow-700 border-yellow-100",
    bar: "bg-yellow-500",
  },
  at_risk: {
    badge: "bg-red-50 text-red-700 border-red-100",
    bar: "bg-red-500",
  },
};

export const kpiToneStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  orange: {
    icon: "bg-amber-50 text-amber-600",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  red: {
    icon: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700 border-red-100",
  },
} as const;
