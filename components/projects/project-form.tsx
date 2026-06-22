"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
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
    name: z.string().min(1, "Project title is required"),
    description: z.string().optional(),
    projectCode: z.string().optional(),
    brdReceivingDate: z
      .string()
      .optional()
      .refine((s) => !s || !!parseTicketDateLocal(s), "Invalid BRD date"),
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
    projectStatusId: z.string().min(1, "Project status is required"),
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
    { message: "Assign To is required when action is Assigned", path: ["assignToId"] },
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
    projectStatusId: project.projectStatusId ?? "",
    projectManagerId: project.projectManagerId ?? "",
    priorityId: project.priorityId ?? "",
    projectAction: project.projectAction ?? undefined,
    assignToId: project.assignToId ?? "",
    taskTemplateId: project.taskTemplateId ?? "",
    isDraft: project.isDraft ?? false,
  };
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4", className)}>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}

export function ProjectForm({
  defaultValues,
  members = [],
  onSubmit,
  onSaveDraft,
  loading,
  submitLabel = "Save project",
}: {
  defaultValues?: Partial<ProjectFormData> | Project;
  members?: ProjectMember[];
  onSubmit: (data: ProjectFormData) => void;
  onSaveDraft?: (data: ProjectFormData) => void;
  loading?: boolean;
  submitLabel?: string;
}) {
  const resolvedDefaults =
    defaultValues && "id" in defaultValues
      ? projectToFormDefaults(defaultValues as Project)
      : (defaultValues as Partial<ProjectFormData> | undefined);

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-6"
    >
      <Section title="Project identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="projectCode">Project code</Label>
            <Input
              id="projectCode"
              placeholder="Auto-generated on save"
              readOnly={!resolvedDefaults?.projectCode}
              {...register("projectCode")}
            />
          </div>
          <Controller
            name="brdReceivingDate"
            control={control}
            render={({ field }) => (
              <DatePickerField
                id="brdReceivingDate"
                label="BRD receiving date"
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Project title *</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">High-level scope</Label>
          <Textarea id="description" rows={4} {...register("description")} />
        </div>
      </Section>

      <Section title="Classification">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LookupSelect control={control} name="projectTypeId" label="Project type" options={lookups?.projectTypes} />
          <LookupSelect control={control} name="categoryId" label="Category" options={lookups?.categories} />
          <LookupSelect control={control} name="priorityId" label="Priority *" options={lookups?.priorities} error={errors.priorityId?.message} />
          <LookupSelect control={control} name="projectStatusId" label="Project status *" options={lookups?.projectStatuses} error={errors.projectStatusId?.message} />
          <LookupSelect control={control} name="taskTemplateId" label="Task template" options={lookups?.taskTemplates} />
        </div>
      </Section>

      <Section title="Timeline">
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
      </Section>

      <Section title="People & assignment">
        <div className="grid gap-4 sm:grid-cols-2">
          <LookupSelect control={control} name="initiatedById" label="Project initiated by" options={lookups?.initiatedBy} />
          <LookupSelect
            control={control}
            name="departmentalPocId"
            label="Departmental POC"
            options={pocsQuery.data}
            disabled={!initiatedById}
          />
          <LookupSelect
            control={control}
            name="projectManagerId"
            label="Project manager"
            options={memberOptions.length ? memberOptions : lookups?.initiatedBy}
          />
          <LookupSelect control={control} name="projectAction" label="Action taken" options={lookups?.projectActions} />
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
        <Controller
          name="partnerIds"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Partners</Label>
              <div className="flex flex-wrap gap-2">
                {(memberOptions.length ? memberOptions : []).map((opt) => {
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
      </Section>

      <div className="flex flex-wrap justify-end gap-2">
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleSubmit((data) => onSaveDraft({ ...data, isDraft: true }))}
          >
            Temporary save
          </Button>
        )}
        <Button type="submit" disabled={loading || lookupsQuery.isLoading}>
          {loading ? "Saving…" : submitLabel}
        </Button>
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
