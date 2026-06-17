"use client";

import { format } from "date-fns";
import type { StandupEntry } from "@/lib/api/types";
import { formatStandupProjectNames } from "@/lib/utils/standup";
import { EmptyState } from "@/components/ui/empty-state";

export function StandupHistory({ entries }: { entries: StandupEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No standup history"
        description="Submitted standups will appear here."
      />
    );
  }

  return (
    <div className="divide-y divide-slate-200/80 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      {entries.map((entry) => (
        <div key={entry.id} className="px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{entry.userName}</p>
              <p className="text-xs text-muted-foreground">
                {formatStandupProjectNames(entry)}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.submittedAt), "MMM d, yyyy · h:mm a")}
            </span>
          </div>
          <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground/80">Yesterday: </span>
              {entry.yesterday}
            </div>
            <div>
              <span className="font-medium text-foreground/80">Today: </span>
              {entry.today}
            </div>
            <div>
              <span className="font-medium text-foreground/80">Blockers: </span>
              {entry.blockers}
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
