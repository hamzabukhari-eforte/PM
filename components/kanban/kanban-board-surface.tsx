"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { ProjectMember } from "@/lib/api/types";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { TaskDetailSheet } from "@/components/kanban/task-detail-sheet";
import { TaskFollowupSheet } from "@/components/followup/task-followup-sheet";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { kanbanCollisionDetection } from "@/lib/utils/kanban-board-utils";
import type { useKanbanBoard } from "@/lib/hooks/use-kanban-board";

type KanbanBoardState = ReturnType<typeof useKanbanBoard>;

export function KanbanBoardSurface({
  state,
  members,
  canArchive,
}: {
  state: KanbanBoardState;
  members: ProjectMember[];
  canArchive: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={kanbanCollisionDetection}
        onDragStart={state.handleDragStart}
        onDragOver={state.handleDragOver}
        onDragEnd={state.handleDragEnd}
        onDragCancel={state.handleDragCancel}
      >
        <div className="w-full min-w-0 overflow-x-hidden">
          <div className="scrollbar-hidden -mx-6 flex w-full min-w-0 gap-4 overflow-x-auto overscroll-x-contain px-6 pb-1 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
            {state.dragColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                draggingTaskId={state.activeTask?.id}
                members={members}
                linkTargets={state.linkTargets}
                hierarchyIndex={state.hierarchyIndex}
                onCreateTask={state.handleCreateTask}
                onEditTask={state.setEditingTask}
                onOpenTask={state.setSelectedTask}
                onArchiveTask={canArchive ? state.handleArchiveTask : undefined}
                canArchive={canArchive}
                creating={state.createMutation.isPending}
              />
            ))}
          </div>
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1)",
          }}
        >
          {state.activeTask ? (
            <KanbanCard
              task={state.activeTask}
              hierarchyIndex={state.hierarchyIndex}
              overlay
            />
          ) : null}
        </DragOverlay>

        <TaskDetailSheet
          task={state.detailTask}
          open={!!state.detailTask}
          onOpenChange={(open) => {
            if (!open) state.setSelectedTask(null);
          }}
          hierarchyIndex={state.hierarchyIndex}
          onEdit={state.setEditingTask}
          onFollowup={state.setFollowupTask}
          onToggleSubtask={state.handleToggleSubtask}
          togglingSubtaskId={state.togglingSubtaskId}
        />

        <TaskFollowupSheet
          task={state.followupTask}
          open={!!state.followupTask}
          onOpenChange={(open) => {
            if (!open) state.setFollowupTask(null);
          }}
        />
      </DndContext>

      <EditTaskDialog
        task={state.editingTask}
        open={!!state.editingTask}
        onOpenChange={(open) => {
          if (!open) state.setEditingTask(null);
        }}
        members={members}
        linkTargets={state.linkTargets}
        onSubmit={state.handleEditTask}
        loading={state.updateMutation.isPending}
      />
    </>
  );
}
