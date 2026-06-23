"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectLookups } from "@/lib/api/types";
import type { ProjectFormData } from "@/components/projects/project-form-schema";
import { ProjectFormLookupSelect } from "@/components/projects/project-form-lookup-select";
import { cn } from "@/lib/utils";

export function ProjectFormAdvancedSection({
  control,
  errors,
  register,
  isEdit,
  lookups,
  pocs,
  memberOptions,
  initiatedById,
  projectAction,
}: {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  register: ReturnType<typeof import("react-hook-form").useForm<ProjectFormData>>["register"];
  isEdit: boolean;
  lookups?: ProjectLookups;
  pocs?: { id: string; label: string }[];
  memberOptions: { id: string; label: string }[];
  initiatedById?: string;
  projectAction?: "hold" | "assigned";
}) {
  function togglePartner(id: string, current: string[]) {
    return current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  }

  return (
    <div className="space-y-6 border-t border-slate-200 px-5 pb-5 pt-4">
      {isEdit && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="projectCode">Project code</Label>
            <Input id="projectCode" readOnly {...register("projectCode")} />
          </div>
          <Controller
            name="brdReceivingDate"
            control={control}
            render={({ field }) => (
              <DatePickerField
                id="brdReceivingDate"
                label="Requirements received (optional)"
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      )}

      {!isEdit && (
        <Controller
          name="brdReceivingDate"
          control={control}
          render={({ field }) => (
            <DatePickerField
              id="brdReceivingDate"
              label="Requirements received (optional)"
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectFormLookupSelect control={control} name="priorityId" label="Priority *" options={lookups?.priorities} error={errors.priorityId?.message} />
        <ProjectFormLookupSelect control={control} name="projectStatusId" label="Status *" options={lookups?.projectStatuses} error={errors.projectStatusId?.message} />
        <ProjectFormLookupSelect control={control} name="projectTypeId" label="Project type" options={lookups?.projectTypes} />
        <ProjectFormLookupSelect control={control} name="categoryId" label="Category" options={lookups?.categories} />
        <ProjectFormLookupSelect control={control} name="taskTemplateId" label="Task template" options={lookups?.taskTemplates} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ProjectFormLookupSelect control={control} name="initiatedById" label="Initiated by" options={lookups?.initiatedBy} />
        <ProjectFormLookupSelect control={control} name="departmentalPocId" label="Department contact" options={pocs} disabled={!initiatedById} />
        <ProjectFormLookupSelect control={control} name="projectManagerId" label="Project manager" options={memberOptions.length ? memberOptions : lookups?.initiatedBy} />
        <ProjectFormLookupSelect control={control} name="projectAction" label="Status action" options={lookups?.projectActions} />
        {projectAction === "assigned" && (
          <ProjectFormLookupSelect
            control={control}
            name="assignToId"
            label="Assign to *"
            options={memberOptions.length ? memberOptions : pocs}
            error={errors.assignToId?.message}
          />
        )}
      </div>

      {memberOptions.length > 0 && (
        <Controller
          name="partnerIds"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Partners</Label>
              <div className="flex flex-wrap gap-2">
                {memberOptions.map((opt) => {
                  const checked = (field.value ?? []).includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors",
                        checked
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => field.onChange(togglePartner(opt.id, field.value ?? []))}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
