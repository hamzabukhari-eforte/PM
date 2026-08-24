"use client";

import { useRouter } from "next/navigation";
import type { Sprint } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUiStore } from "@/lib/stores/ui-store";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";

const statusVariant: Record<Sprint["status"], "success" | "default" | "secondary"> = {
  active: "success",
  planned: "default",
  closed: "secondary",
};

export function SprintList({
  sprints,
  projectId,
  canManage,
  onClose,
}: {
  sprints: Sprint[];
  projectId: string;
  canManage: boolean;
  onClose: (sprintId: string) => void;
}) {
  const router = useRouter();
  const setProjectContext = useUiStore((s) => s.setProjectContext);

  function openSprint(sprintId: string, path: string) {
    setProjectContext(projectId, sprintId);
    router.push(path);
  }

  if (sprints.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sprints.map((sprint) => (
        <Card key={sprint.id} className="card-interactive border-slate-200/80">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">
                <button
                  type="button"
                  onClick={() => openSprint(sprint.id, SCREEN_PATHS.sprint)}
                  className="text-left transition-colors hover:text-primary"
                >
                  {sprint.name}
                </button>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{sprint.goal}</p>
            </div>
            <Badge variant={statusVariant[sprint.status]}>{sprint.status}</Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {sprint.startDate} → {sprint.endDate}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openSprint(sprint.id, SCREEN_PATHS.board)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-[0.98]"
              >
                Open board
              </button>
              {canManage && sprint.status === "active" && (
                <Button variant="ghost" size="sm" onClick={() => onClose(sprint.id)}>
                  Close
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
