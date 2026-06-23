"use client";

import type { Board, ProjectMember } from "@/lib/api/types";
import { BoardAssigneeFilter } from "@/components/kanban/board-assignee-filter";
import { KanbanBoardSurface } from "@/components/kanban/kanban-board-surface";
import { useKanbanBoard } from "@/lib/hooks/use-kanban-board";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canArchiveTasks } from "@/lib/utils/roles";

export function KanbanBoard({
  board,
  projectId,
  sprintId,
  members,
}: {
  board: Board;
  projectId: string;
  sprintId: string;
  members: ProjectMember[];
}) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const userRole = useAuthStore((s) => s.user?.role);
  const canArchive = canArchiveTasks(userRole);

  const state = useKanbanBoard(board, projectId, sprintId, members, currentUserId);

  return (
    <div className="min-w-0 space-y-5">
      <BoardAssigneeFilter
        members={members}
        currentUserId={currentUserId}
        value={state.assigneeFilter}
        onChange={state.setAssigneeFilter}
      />
      <KanbanBoardSurface state={state} members={members} canArchive={canArchive} />
    </div>
  );
}
