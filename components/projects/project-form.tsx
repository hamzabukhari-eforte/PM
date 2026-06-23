"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
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
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project, ProjectLookups, ProjectMember } from "@/lib/api/types";
import {
  isoOrDateToTicketDateLocal,
  parseTicketDateLocal,
} from "@/lib/utils/ticket-datetime";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    projectCode: z.string().optional(),
    brdReceivingDate: z
      .string()
      .optional()
      .refine((s) => !s || !!parseTicketDateLocal(s), "Invalid date"),
    projectTypeId: z.string().optional(),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((s) => !!parseTicketDateLocal(s), "Invalid start date"),
    endDate: z
      .string()
      .min(1, "End date is required")
      .refine((s) => !!parseTicketDateLocal(s), "Invalid end date"),
    categoryId: z.string().optional(),
    initiatedById: z.string().optional(),
    departmentalPocId: z.string().optional(),
    partnerIds: z.array(z.string()).optional(),
    projectStatusId: z.string().min(1, "Status is required"),
    projectManagerId: z.string().optional(),
    priorityId: z.string().min(1, "Priority is required"),
    projectAction: z.enum(["hold", "assigned"]).optional(),
    assignToId: z.string().optional(),
    taskTemplateId: z.string().optional(),
    isDraft: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const start = parseTicketDateLocal(data.startDate);
      const end = parseTicketDateLocal(data.endDate);
      if (!start || !end) return true;
      return end >= start;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => data.projectAction !== "assigned" || !!data.assignToId,
    { message: "Choose who to assign when status action is Assigned", path: ["assignToId"] },
  );

export type ProjectFormData = z.infer<typeof schema>;

function projectToFormDefaults(project: Project): ProjectFormData {
  return {
    name: project.name,
    description: project.description,
    projectCode: project.projectCode ?? "",
    brdReceivingDate: isoOrDateToTicketDateLocal(project.brdReceivingDate),
    projectTypeId: project.projectTypeId ?? "",
    startDate: isoOrDateToTicketDateLocal(project.startDate),
    endDate: isoOrDateToTicketDateLocal(project.endDate),
    categoryId: project.categoryId ?? "",
    initiatedById: project.initiatedById ?? "",
    departmentalPocId: project.departmentalPocId ?? "",
    partnerIds: project.partnerIds ?? [],
    projectStatusId: project.projectStatusId ?? "ps-active",
    projectManagerId: project.projectManagerId ?? "",
    priorityId: project.priorityId ?? "pri-medium",
    projectAction: project.projectAction ?? undefined,
    assignToId: project.assignToId ?? "",
    taskTemplateId: project.taskTemplateId ?? "",
    isDraft: project.isDraft ?? false,
  };
}

export function ProjectForm({
  defaultValues,
  members = [],
  onSubmit,
  onSaveDraft,
  onCancel,
  loading,
  submitLabel = "Create project",
  mode = "create",
}: {
  defaultValues?: Partial<ProjectFormData> | Project;
  members?: ProjectMember[];
  onSubmit: (data: ProjectFormData) => void;
  onSaveDraft?: (data: ProjectFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
  mode?: "create" | "edit";
}) {
  const isEdit = mode === "edit" || (defaultValues && "id" in defaultValues);
  const resolvedDefaults =
    defaultValues && "id" in defaultValues
      ? projectToFormDefaults(defaultValues as Project)
      : (defaultValues as Partial<ProjectFormData> | undefined);

  const [advancedOpen, setAdvancedOpen] = useState(isEdit);

  const lookupsQuery = useQuery({
    queryKey: ["lookups", "project"],
    queryFn: () => apiClient<ProjectLookups>(endpoints.lookups.project),
  });
  const lookups = lookupsQuery.data;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      partnerIds: [],
      isDraft: false,
      brdReceivingDate: "",
      startDate: "",
      endDate: "",
      projectStatusId: "ps-active",
      priorityId: "pri-medium",
      ...resolvedDefaults,
    },
  });

  const initiatedById = watch("initiatedById");
  const projectAction = watch("projectAction");

  const pocsQuery = useQuery({
    queryKey: ["lookups", "pocs", initiatedById],
    queryFn: () =>
      apiClient<{ id: string; label: string }[]>(
        endpoints.lookups.departmentalPocs(initiatedById!),
      ),
    enabled: !!initiatedById,
  });

  useEffect(() => {
    setValue("departmentalPocId", "");
  }, [initiatedById, setValue]);

  const memberOptions =
    members.length > 0
      ? members.map((m) => ({ id: m.userId, label: m.name }))
      : [];

  function togglePartner(id: string, current: string[]) {
    return current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
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

      <div className="rounded-xl border border-slate-200 bg-slate-50/50">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">Advanced options</p>
            <p className="text-xs text-slate-500">
              Classification, people, templates, and legacy fields
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-slate-400 transition-transform",
              advancedOpen && "rotate-180",
            )}
          />
        </button>

        {advancedOpen && (
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
              <LookupSelect control={control} name="priorityId" label="Priority *" options={lookups?.priorities} error={errors.priorityId?.message} />
              <LookupSelect control={control} name="projectStatusId" label="Status *" options={lookups?.projectStatuses} error={errors.projectStatusId?.message} />
              <LookupSelect control={control} name="projectTypeId" label="Project type" options={lookups?.projectTypes} />
              <LookupSelect control={control} name="categoryId" label="Category" options={lookups?.categories} />
              <LookupSelect control={control} name="taskTemplateId" label="Task template" options={lookups?.taskTemplates} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <LookupSelect control={control} name="initiatedById" label="Initiated by" options={lookups?.initiatedBy} />
              <LookupSelect
                control={control}
                name="departmentalPocId"
                label="Department contact"
                options={pocsQuery.data}
                disabled={!initiatedById}
              />
              <LookupSelect
                control={control}
                name="projectManagerId"
                label="Project manager"
                options={memberOptions.length ? memberOptions : lookups?.initiatedBy}
              />
              <LookupSelect control={control} name="projectAction" label="Status action" options={lookups?.projectActions} />
              {projectAction === "assigned" && (
                <LookupSelect
                  control={control}
                  name="assignToId"
                  label="Assign to *"
                  options={memberOptions.length ? memberOptions : pocsQuery.data}
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
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        {onCancel ? (
          <Button type="button" variant="ghost" disabled={loading} onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleSubmit((data) => onSaveDraft({ ...data, isDraft: true }))}
            >
              Save draft
            </Button>
          )}
          <Button type="submit" disabled={loading || lookupsQuery.isLoading}>
            {loading ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function LookupSelect({
  control,
  name,
  label,
  options,
  error,
  disabled,
}: {
  control: ReturnType<typeof useForm<ProjectFormData>>["control"];
  name: keyof ProjectFormData;
  label: string;
  options?: { id: string; label: string }[];
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value ? String(field.value) : "none"}
            onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {options?.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
