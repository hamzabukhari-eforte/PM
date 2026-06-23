"use client";

import { RefreshCw, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task, TaskStatus } from "@/lib/api/types";
import { recurrenceLabels } from "@/lib/utils/routine";
import { isoToTicketDateTimeLocal } from "@/lib/utils/ticket-datetime";
import { formatAssigneeNames } from "@/lib/utils/task-assignees";
import { personalTaskStatusFlow, personalTaskStatusLabels } from "@/lib/utils/personal-task-status";

export function PersonalTaskCard({
  task,
  canUpdate,
  onStatusChange,
}: {
  task: Task;
  canUpdate: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  const nextIdx = personalTaskStatusFlow.indexOf(task.status) + 1;
  const nextStatus =
    nextIdx < personalTaskStatusFlow.length ? personalTaskStatusFlow[nextIdx] : null;

  return (
    <Card className="card-interactive h-full border-slate-200/80">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-medium leading-snug">{task.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {personalTaskStatusLabels[task.status]}
          </Badge>
        </div>
        {task.description && <p className="text-sm text-slate-500">{task.description}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {task.assigneeNames.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {formatAssigneeNames(task.assigneeNames)}
            </span>
          )}
          {task.storyPoints != null && <span>{task.storyPoints} pts</span>}
          {task.kind === "routine" && task.recurrenceInterval && (
            <span className="flex items-center gap-1 text-indigo-600">
              <RefreshCw className="h-3 w-3" />
              {recurrenceLabels[task.recurrenceInterval]}
            </span>
          )}
          {task.nextReminderAt && (
            <span>Next: {format(new Date(task.nextReminderAt), "MMM d, h:mm a")}</span>
          )}
          {task.timelineStart && task.timelineEnd && (
            <span className="flex items-center gap-1">
              <CalendarRange className="h-3 w-3" />
              {isoToTicketDateTimeLocal(task.timelineStart)} →{" "}
              {isoToTicketDateTimeLocal(task.timelineEnd)}
            </span>
          )}
        </div>
        {canUpdate && nextStatus && (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => onStatusChange(task.id, nextStatus)}
          >
            Move to {personalTaskStatusLabels[nextStatus]}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
