"use client";

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
import { useRequireSprintContext } from "@/lib/hooks/use-project-context";
import { useUiStore } from "@/lib/stores/ui-store";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";

export function BoardView() {
  const { projectId, sprintId } = useRequireSprintContext();
  const setLastBoard = useUiStore((s) => s.setLastBoard);

  const { data: board, isLoading, isError, refetch } = useQuery({
    queryKey: ["board", projectId, sprintId],
    queryFn: () => apiClient<Board>(endpoints.projects.board(projectId!, sprintId!)),
    enabled: !!projectId && !!sprintId,
  });

  const membersQuery = useProjectMembers(projectId ?? undefined);

  useEffect(() => {
    if (projectId && sprintId) {
      setLastBoard(SCREEN_PATHS.board, "Kanban board");
    }
  }, [projectId, sprintId, setLastBoard]);

  if (!projectId || !sprintId) {
    return (
      <>
        <AppHeader title="Kanban board" />
        <LoadingState label="Select a project and sprint…" />
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Kanban board"
        description="Drag cards between columns · click a task for details"
      />
      <PageContent className="min-w-0 bg-transparent pt-4">
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
