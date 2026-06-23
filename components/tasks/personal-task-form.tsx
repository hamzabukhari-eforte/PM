"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DateTimePickerField } from "@/components/ui/date-time-picker-field";
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
import { MemberMultiSelect } from "@/components/ui/member-multi-select";
import type { RecurrenceInterval, User } from "@/lib/api/types";
import { parseTicketDateTimeLocal } from "@/lib/utils/ticket-datetime";
import { recurrenceLabels } from "@/lib/utils/routine";

const baseSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    storyPoints: z.string().optional(),
    assigneeIds: z.array(z.string()).min(1, "At least one assignee is required"),
    timelineStart: z
      .string()
      .min(1, "From date & time is required")
      .refine((s) => !!parseTicketDateTimeLocal(s), "Invalid from date & time"),
    timelineEnd: z
      .string()
      .min(1, "To date & time is required")
      .refine((s) => !!parseTicketDateTimeLocal(s), "Invalid to date & time"),
  })
  .refine(
    (data) => {
      const start = parseTicketDateTimeLocal(data.timelineStart);
      const end = parseTicketDateTimeLocal(data.timelineEnd);
      if (!start || !end) return true;
      return end >= start;
    },
    {
      message: "To must be on or after from",
      path: ["timelineEnd"],
    },
  );

export type PersonalTaskFormData = z.infer<typeof baseSchema> & {
  recurrenceInterval?: RecurrenceInterval;
};

export function PersonalTaskForm({
  kind,
  assignees,
  onSubmit,
  onCancel,
  loading,
  submitLabel = "Create task",
}: {
  kind: "miscellaneous" | "routine";
  assignees: User[];
  onSubmit: (data: PersonalTaskFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
}) {
  const schema =
    kind === "routine"
      ? baseSchema.extend({
          recurrenceInterval: z.enum(["hour", "day", "week", "month", "year"]),
        })
      : baseSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PersonalTaskFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      assigneeIds: [],
      recurrenceInterval: kind === "routine" ? "week" : undefined,
      timelineStart: "",
      timelineEnd: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="personal-title">Title</Label>
        <Input
          id="personal-title"
          placeholder={
            kind === "routine" ? "Weekly backup check" : "Renew SSL certificates"
          }
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="personal-description">Description</Label>
        <Textarea
          id="personal-description"
          rows={3}
          placeholder="Optional details…"
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="timelineStart"
          control={control}
          render={({ field }) => (
            <DateTimePickerField
              id="personal-timeline-start"
              label="From"
              required
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="timelineEnd"
          control={control}
          render={({ field }) => (
            <DateTimePickerField
              id="personal-timeline-end"
              label="To"
              required
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      {(errors.timelineStart || errors.timelineEnd) && (
        <p className="text-sm text-destructive">
          {errors.timelineStart?.message ?? errors.timelineEnd?.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="personal-storyPoints">Story points</Label>
          <Input
            id="personal-storyPoints"
            type="number"
            min={0}
            placeholder="e.g. 3"
            {...register("storyPoints")}
          />
        </div>
        <div className="space-y-2">
          <Label>Assigned to</Label>
          <Controller
            name="assigneeIds"
            control={control}
            render={({ field }) => (
              <MemberMultiSelect
                members={assignees.map((u) => ({ userId: u.id, name: u.name }))}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Select team members…"
              />
            )}
          />
          {errors.assigneeIds && (
            <p className="text-sm text-destructive">{errors.assigneeIds.message}</p>
          )}
        </div>
      </div>

      {kind === "routine" && (
        <div className="space-y-2">
          <Label>Remind every</Label>
          <Controller
            name="recurrenceInterval"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(recurrenceLabels) as RecurrenceInterval[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {recurrenceLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
