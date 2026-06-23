"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project, ProjectLookups, ProjectMember } from "@/lib/api/types";
import {
  projectFormSchema,
  projectToFormDefaults,
  type ProjectFormData,
} from "@/components/projects/project-form-schema";
import { ProjectFormBasicsSection } from "@/components/projects/project-form-basics-section";
import { ProjectFormAdvancedSection } from "@/components/projects/project-form-advanced-section";
import { cn } from "@/lib/utils";

export type { ProjectFormData } from "@/components/projects/project-form-schema";

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

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
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
    members.length > 0 ? members.map((m) => ({ id: m.userId, label: m.name })) : [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <ProjectFormBasicsSection control={control} errors={errors} register={register} />

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
          <ProjectFormAdvancedSection
            control={control}
            errors={errors}
            register={register}
            isEdit={!!isEdit}
            lookups={lookupsQuery.data}
            pocs={pocsQuery.data}
            memberOptions={memberOptions}
            initiatedById={initiatedById}
            projectAction={projectAction}
          />
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
