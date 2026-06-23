"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Board, Task } from "@/lib/api/types";
import type { TaskHierarchyEntry } from "@/lib/utils/task-hierarchy";
import { cn } from "@/lib/utils";
import { KanbanCardView } from "@/components/kanban/kanban-card-view";

type KanbanCardProps = {
  task: Task;
  board?: Board;
  hierarchyIndex?: Map<string, TaskHierarchyEntry>;
  overlay?: boolean;
  dragHidden?: boolean;
  onOpen?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  canArchive?: boolean;
};

function SortableKanbanCard({ dragHidden, ...props }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
      }}
      className={cn((dragHidden || isDragging) && "opacity-0")}
    >
      <KanbanCardView
        {...props}
        dragHandleProps={{
          ref: setActivatorNodeRef,
          attributes,
          listeners,
        }}
      />
    </div>
  );
}

export function KanbanCard(props: KanbanCardProps) {
  if (props.overlay) {
    return (
      <div className="w-[24rem] max-w-[85vw]">
        <KanbanCardView {...props} />
      </div>
    );
  }

  return <SortableKanbanCard {...props} />;
}
