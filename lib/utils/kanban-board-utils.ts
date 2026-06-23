import { closestCorners, pointerWithin, type CollisionDetection } from "@dnd-kit/core";
import type { BoardColumn } from "@/lib/api/types";

export const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCorners(args);
};

export function findColumnId(columns: BoardColumn[], taskOrColumnId: string): string | null {
  if (columns.some((column) => column.id === taskOrColumnId)) return taskOrColumnId;
  for (const column of columns) {
    if (column.tasks.some((task) => task.id === taskOrColumnId)) return column.id;
  }
  return null;
}

export function sortBoardColumns(columns: BoardColumn[]): BoardColumn[] {
  return columns
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((column) => ({
      ...column,
      tasks: column.tasks.slice().sort((a, b) => a.order - b.order),
    }));
}
