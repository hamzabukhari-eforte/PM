"use client";

import { useStandupGate } from "@/lib/hooks/use-standup-gate";
import { LoadingState } from "@/components/ui/loading-state";

export function StandupGate({ children }: { children: React.ReactNode }) {
  const { loading, blocked } = useStandupGate();

  if (loading) return <LoadingState />;
  if (blocked) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="font-medium text-slate-900">Standup required</p>
        <p className="max-w-sm text-sm text-slate-500">
          Complete the daily standup modal to access the Kanban board.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
