"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Board } from "@/lib/api/types";
import { useProjectMembers } from "@/lib/hooks/use-project-members";

export function BoardView() {
  const params = useParams<{ projectId: string; sprintId: string }>();
  const { projectId, sprintId } = params;

  const { data: board, isLoading, isError, refetch } = useQuery({
    queryKey: ["board", projectId, sprintId],
    queryFn: () => apiClient<Board>(endpoints.projects.board(projectId, sprintId)),
    enabled: !!projectId && !!sprintId,
  });

  const membersQuery = useProjectMembers(projectId);

  return (
    <>
      <AppHeader title="Kanban Board" />
      <div className="bg-slate-50/50 p-6 lg:p-8">
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {board && (
          <KanbanBoard
            board={board}
            projectId={projectId}
            sprintId={sprintId}
            members={membersQuery.data ?? []}
          />
        )}
      </div>
    </>
  );
}
