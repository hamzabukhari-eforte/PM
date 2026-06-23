"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "cards" | "table";

export function ViewModeToggle({
  value,
  onChange,
  className,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm",
        className,
      )}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => onChange("cards")}
        className={cn(
          "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
          value === "cards"
            ? "bg-indigo-50 text-indigo-700 shadow-sm"
            : "text-slate-500 hover:text-slate-800",
        )}
        aria-pressed={value === "cards"}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Cards
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cn(
          "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
          value === "table"
            ? "bg-indigo-50 text-indigo-700 shadow-sm"
            : "text-slate-500 hover:text-slate-800",
        )}
        aria-pressed={value === "table"}
      >
        <Table2 className="h-3.5 w-3.5" />
        Table
      </button>
    </div>
  );
}
