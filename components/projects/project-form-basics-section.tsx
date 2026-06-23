"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectFormData } from "@/components/projects/project-form-schema";

export function ProjectFormBasicsSection({
  control,
  errors,
  register,
}: {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  register: ReturnType<typeof import("react-hook-form").useForm<ProjectFormData>>["register"];
}) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Project basics</h3>
        <p className="mt-1 text-sm text-slate-500">
          Start with the essentials. You can add more details anytime.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Project name *</Label>
        <Input id="name" placeholder="e.g. Customer portal redesign" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="What is this project about?"
          {...register("description")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DatePickerField
              id="startDate"
              label="Start date"
              required
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <DatePickerField
              id="endDate"
              label="End date"
              required
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      {(errors.startDate || errors.endDate) && (
        <p className="text-sm text-destructive">
          {errors.startDate?.message ?? errors.endDate?.message}
        </p>
      )}
    </section>
  );
}
