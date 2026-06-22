"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePickerField } from "@/components/ui/date-time-picker-field";
import { LoadingState } from "@/components/ui/loading-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  FollowupFormField,
  ProjectLookups,
  Task,
  TaskFollowupContext,
  TaskFollowupInput,
} from "@/lib/api/types";
import { isoToTicketDateTimeLocal } from "@/lib/utils/ticket-datetime";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm text-slate-700">{value || "—"}</p>
    </div>
  );
}

type FollowupFormValues = TaskFollowupInput & { custom: Record<string, string> };

function DynamicField({
  field,
  control,
}: {
  field: FollowupFormField;
  control: ReturnType<typeof useForm<FollowupFormValues>>["control"];
}) {
  const name = `custom.${field.id}` as `custom.${string}`;

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Controller
          name={name}
          control={control}
          render={({ field: f }) => (
            <Textarea rows={3} value={f.value ?? ""} onChange={f.onChange} />
          )}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Controller
          name={name}
          control={control}
          render={({ field: f }) => (
            <Select value={f.value ?? "none"} onValueChange={(v) => f.onChange(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field: f }) => <Input value={f.value ?? ""} onChange={f.onChange} />}
      />
    </div>
  );
}

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
    mutationFn: (body: TaskFollowupInput) =>
      apiClient(endpoints.tasks.followup(task!.id), {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["followup", task?.id] });
      onOpenChange(false);
    },
  });

  if (!task) return null;

  const ctx = ctxQuery.data;
  const lookups = lookupsQuery.data;

  function onSubmit(data: FollowupFormValues) {
    const { custom, ...rest } = data;
    saveMutation.mutate({
      ...rest,
      completionPercent: Number(rest.completionPercent),
      customFormValues: custom,
    });
  }

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
                <ReadOnlyField label="Project" value={ctx.projectName ?? "—"} />
                <ReadOnlyField label="Assign by" value={ctx.assignByName ?? "—"} />
                <ReadOnlyField label="Assign to" value={task.assigneeName ?? "Unassigned"} />
                <ReadOnlyField
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

              <form id="followup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="followupStart"
                    control={control}
                    render={({ field }) => (
                      <DateTimePickerField id="followupStart" label="Follow-up start" value={field.value} onChange={field.onChange} />
                    )}
                  />
                  <Controller
                    name="followupEnd"
                    control={control}
                    render={({ field }) => (
                      <DateTimePickerField id="followupEnd" label="Follow-up end" value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Follow-up details</Label>
                  <Textarea id="details" rows={4} {...register("details")} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Completion %</Label>
                    <Controller
                      name="completionPercent"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {lookups?.completionPercents.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Task status</Label>
                    <Controller
                      name="taskStatusId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || "none"}
                          onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">—</SelectItem>
                            {lookups?.taskStatuses.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {ctx.formFields.length > 0 && (
                  <section className="space-y-3 rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-800">Custom form</h3>
                    {ctx.formFields.map((f) => (
                      <DynamicField key={f.id} field={f} control={control} />
                    ))}
                  </section>
                )}

                <div className="space-y-2">
                  <Label htmlFor="documentTitle">Document title</Label>
                  <Input id="documentTitle" {...register("documentTitle")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDoc">Upload document (PDF)</Label>
                  <Input id="taskDoc" type="file" accept="application/pdf" />
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...register("reopenTask")} className="h-4 w-4 rounded" />
                    Reopen task
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...register("criticalTask")} className="h-4 w-4 rounded" />
                    Critical task
                  </label>
                </div>
              </form>
            </>
          )}
        </SheetBody>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="followup-form" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving…" : "Save follow-up"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
