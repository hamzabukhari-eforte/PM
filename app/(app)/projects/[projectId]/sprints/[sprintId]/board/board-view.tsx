"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { PageContent } from "@/components/layout/page-content";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Board } from "@/lib/api/types";
import { useProjectMembers } from "@/lib/hooks/use-project-members";
import { useUiStore } from "@/lib/stores/ui-store";
import { boardPath } from "@/lib/hooks/use-project-board";

export function BoardView() {
  const params = useParams<{ projectId: string; sprintId: string }>();
  const { projectId, sprintId } = params;
  const setLastBoard = useUiStore((s) => s.setLastBoard);
  const setActiveProjectId = useUiStore((s) => s.setActiveProjectId);

  const { data: board, isLoading, isError, refetch } = useQuery({
    queryKey: ["board", projectId, sprintId],
    queryFn: () => apiClient<Board>(endpoints.projects.board(projectId, sprintId)),
    enabled: !!projectId && !!sprintId,
  });

  const membersQuery = useProjectMembers(projectId);

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId);
  }, [projectId, setActiveProjectId]);

  useEffect(() => {
    if (projectId && sprintId) {
      setLastBoard(boardPath(projectId, sprintId), "Kanban board");
    }
  }, [projectId, sprintId, setLastBoard]);

  return (
    <>
      <AppHeader
        title="Kanban board"
        description="Drag cards between columns · click a task for details"
      />
      <PageContent className="bg-transparent pt-4">
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
      </PageContent>
    </>
  );
}
