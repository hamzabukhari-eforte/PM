"use client";

import { Controller, type Control } from "react-hook-form";
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
import type { FollowupFormField, ProjectLookups, TaskFollowupInput } from "@/lib/api/types";

export function FollowupReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm text-slate-700">{value || "—"}</p>
    </div>
  );
}

export type FollowupFormValues = TaskFollowupInput & { custom: Record<string, string> };

export function FollowupDynamicField({
  field,
  control,
}: {
  field: FollowupFormField;
  control: Control<FollowupFormValues>;
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

export function FollowupFormBody({
  control,
  register,
  lookups,
  formFields,
}: {
  control: Control<FollowupFormValues>;
  register: ReturnType<typeof import("react-hook-form").useForm<FollowupFormValues>>["register"];
  lookups?: ProjectLookups;
  formFields: FollowupFormField[];
}) {
  return (
    <form id="followup-form" className="space-y-4">
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
              <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
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

      {formFields.length > 0 && (
        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800">Custom form</h3>
          {formFields.map((f) => (
            <FollowupDynamicField key={f.id} field={f} control={control} />
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
  );
}
