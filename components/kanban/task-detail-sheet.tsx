"use client";

import { Pencil, ClipboardList } from "lucide-react";
import type { Task } from "@/lib/api/types";
import { AssigneeDisplay } from "@/components/tasks/assignee-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProjectTaskTimerBadge } from "@/components/kanban/project-task-timer-badge";
import { TaskDetailSubtaskList } from "@/components/kanban/task-detail-subtasks";
import type { TaskHierarchyEntry } from "@/lib/utils/task-hierarchy";
import { statusFlowLabel } from "@/lib/utils/task-status-flow";

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}

function ProseBlock({ text }: { text: string }) {
  if (!text.trim()) {
    return <p className="text-sm italic text-slate-400">No description provided.</p>;
  }
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{text}</p>
  );
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  hierarchyIndex,
  onEdit,
  onFollowup,
  onToggleSubtask,
  togglingSubtaskId,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hierarchyIndex: Map<string, TaskHierarchyEntry>;
  onEdit?: (task: Task) => void;
  onFollowup?: (task: Task) => void;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
  togglingSubtaskId?: string | null;
}) {
  if (!task) return null;

  const mainLabel = hierarchyIndex.get(task.id)?.label;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <div className="flex flex-wrap items-center gap-2">
            {mainLabel && (
              <span className="font-mono text-sm font-semibold text-slate-400">#{mainLabel}</span>
            )}
            <Badge variant="secondary" className="capitalize">
              {statusFlowLabel(task.status)}
            </Badge>
            <ProjectTaskTimerBadge task={task} size="md" />
          </div>
          <SheetTitle className="mt-3 pr-2">{task.title}</SheetTitle>
        </SheetHeader>

        <SheetBody className="space-y-8">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <MetaItem label="Assignees">
              <AssigneeDisplay names={task.assigneeNames} />
            </MetaItem>
            <MetaItem label="Story points">
              {task.storyPoints != null ? (
                <span className="font-medium">{task.storyPoints}</span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </MetaItem>
            <MetaItem label="Status">{statusFlowLabel(task.status)}</MetaItem>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Description</h3>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <ProseBlock text={task.description} />
            </div>
          </section>

          <TaskDetailSubtaskList
            task={task}
            hierarchyIndex={hierarchyIndex}
            onToggleSubtask={onToggleSubtask}
            togglingSubtaskId={togglingSubtaskId}
          />
        </SheetBody>

        {(onEdit || onFollowup) && (
          <SheetFooter className="gap-2 sm:justify-end">
            {onFollowup && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => onFollowup(task)}
              >
                <ClipboardList className="h-4 w-4" />
                Task follow-up
              </Button>
            )}
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  onEdit(task);
                  onOpenChange(false);
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit task
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
