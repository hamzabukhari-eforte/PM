"use client";

import { Controller, type Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MemberMultiSelect } from "@/components/ui/member-multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePickerField } from "@/components/ui/date-time-picker-field";
import type { PlanTask, ProjectMember } from "@/lib/api/types";
import type { PlanTaskDialogFormData } from "@/components/plan/plan-task-dialog-schema";

export function PlanTaskDialogFields({
  control,
  register,
  members,
  isDependent,
  isMilestone,
  dependencyCandidates,
}: {
  control: Control<PlanTaskDialogFormData>;
  register: ReturnType<typeof import("react-hook-form").useForm<PlanTaskDialogFormData>>["register"];
  members: ProjectMember[];
  isDependent: boolean;
  isMilestone: boolean;
  dependencyCandidates: PlanTask[];
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Task description *</Label>
        <Input id="title" maxLength={100} {...register("title")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Task details</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="timelineStart"
          control={control}
          render={({ field }) => (
            <DateTimePickerField id="timelineStart" label="Start" value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
        <Controller
          name="timelineEnd"
          control={control}
          render={({ field }) => (
            <DateTimePickerField id="timelineEnd" label="End" value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Assigned to</Label>
        <Controller
          name="memberIds"
          control={control}
          render={({ field }) => (
            <MemberMultiSelect
              members={members}
              value={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isDependent")} className="h-4 w-4 rounded" />
        Is dependent task?
      </label>
      {isDependent && (
        <div className="space-y-2">
          <Label>Dependent task</Label>
          <Controller
            name="dependentTaskCode"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || "none"}
                onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select predecessor task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select task…</SelectItem>
                  {dependencyCandidates.map((t) => (
                    <SelectItem key={t.id} value={t.code}>
                      {t.code} — {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {dependencyCandidates.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Add other plan tasks first, then choose which this one depends on.
            </p>
          )}
        </div>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isMilestone")} className="h-4 w-4 rounded" />
        Is milestone task?
      </label>
      {isMilestone && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="milestoneNo">Milestone no.</Label>
            <Input id="milestoneNo" {...register("milestoneNo")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="milestoneDescription">Milestone description</Label>
            <Input id="milestoneDescription" {...register("milestoneDescription")} />
          </div>
        </div>
      )}
    </>
  );
}
