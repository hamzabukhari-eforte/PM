"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProjectLookups, Task, TaskFollowupContext } from "@/lib/api/types";
import { formatAssigneeNames } from "@/lib/utils/task-assignees";
import { isoToTicketDateTimeLocal } from "@/lib/utils/ticket-datetime";
import {
  FollowupFormBody,
  FollowupReadOnlyField,
  type FollowupFormValues,
} from "@/components/followup/followup-form-fields";

export function TaskFollowupSheet({
  task,
  open,
  onOpenChange,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const ctxQuery = useQuery({
    queryKey: ["followup", task?.id],
    queryFn: () => apiClient<TaskFollowupContext>(endpoints.tasks.followup(task!.id)),
    enabled: !!task && open,
  });

  const lookupsQuery = useQuery({
    queryKey: ["lookups", "project"],
    queryFn: () => apiClient<ProjectLookups>(endpoints.lookups.project),
    enabled: open,
  });

  const { register, handleSubmit, control, reset } = useForm<FollowupFormValues>({
    defaultValues: {
      followupStart: "",
      followupEnd: "",
      details: "",
      completionPercent: 0,
      taskStatusId: "",
      documentTitle: "",
      reopenTask: false,
      criticalTask: false,
      custom: {},
    },
  });

  useEffect(() => {
    if (ctxQuery.data?.latestFollowup) {
      const latest = ctxQuery.data.latestFollowup;
      reset({
        followupStart: latest.followupStart,
        followupEnd: latest.followupEnd,
        details: "",
        completionPercent: latest.completionPercent,
        taskStatusId: latest.taskStatusId,
        documentTitle: "",
        reopenTask: false,
        criticalTask: false,
        custom: latest.customFormValues ?? {},
      });
    }
  }, [ctxQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (body: FollowupFormValues) => {
      const { custom, ...rest } = body;
      return apiClient(endpoints.tasks.followup(task!.id), {
        method: "POST",
        body: JSON.stringify({
          ...rest,
          completionPercent: Number(rest.completionPercent),
          customFormValues: custom,
        }),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["followup", task?.id] });
      onOpenChange(false);
    },
  });

  if (!task) return null;

  const ctx = ctxQuery.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined} className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 text-indigo-600">
            <ClipboardList className="h-5 w-5" />
            <span className="text-sm font-medium">Task follow-up</span>
          </div>
          <SheetTitle className="mt-2">{task.title}</SheetTitle>
        </SheetHeader>

        <SheetBody className="space-y-6">
          {ctxQuery.isLoading && <LoadingState />}
          {ctx && (
            <>
              <section className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <FollowupReadOnlyField label="Project" value={ctx.projectName ?? "—"} />
                <FollowupReadOnlyField label="Assign by" value={ctx.assignByName ?? "—"} />
                <FollowupReadOnlyField label="Assign to" value={formatAssigneeNames(task.assigneeNames)} />
                <FollowupReadOnlyField
                  label="Timeline"
                  value={
                    task.timelineStart && task.timelineEnd
                      ? `${isoToTicketDateTimeLocal(task.timelineStart)} → ${isoToTicketDateTimeLocal(task.timelineEnd)}`
                      : "—"
                  }
                />
              </section>

              {task.description && (
                <section className="space-y-2">
                  <Label>Task details</Label>
                  <Textarea readOnly value={task.description} rows={3} className="bg-slate-50" />
                </section>
              )}

              <div onSubmit={handleSubmit((data) => saveMutation.mutate(data))}>
                <FollowupFormBody
                  control={control}
                  register={register}
                  lookups={lookupsQuery.data}
                  formFields={ctx.formFields}
                />
              </div>
            </>
          )}
        </SheetBody>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saveMutation.isPending}
            onClick={handleSubmit((data) => saveMutation.mutate(data))}
          >
            {saveMutation.isPending ? "Saving…" : "Save follow-up"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
