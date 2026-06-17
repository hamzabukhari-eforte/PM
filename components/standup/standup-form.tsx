"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  projectIds: z.array(z.string()).min(1, "Select at least one project"),
  yesterday: z.string().min(1, "Required"),
  today: z.string().min(1, "Required"),
  blockers: z.string(),
});

export type StandupFormData = z.infer<typeof schema>;

function defaultProjectIds(
  projects: Project[],
  defaultProjectId?: string,
  initialProjectIds?: string[],
): string[] {
  if (initialProjectIds?.length) return initialProjectIds;
  if (defaultProjectId && projects.some((p) => p.id === defaultProjectId)) {
    return [defaultProjectId];
  }
  return projects[0] ? [projects[0].id] : [];
}

export function StandupForm({
  projects,
  defaultProjectId,
  initialValues,
  onSubmit,
  loading,
  submitLabel = "Submit standup",
}: {
  projects: Project[];
  defaultProjectId?: string;
  initialValues?: Partial<StandupFormData>;
  onSubmit: (data: StandupFormData) => void;
  loading?: boolean;
  submitLabel?: string;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StandupFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectIds: defaultProjectIds(
        projects,
        defaultProjectId,
        initialValues?.projectIds,
      ),
      yesterday: initialValues?.yesterday ?? "",
      today: initialValues?.today ?? "",
      blockers: initialValues?.blockers ?? "None",
    },
  });

  useEffect(() => {
    reset({
      projectIds: defaultProjectIds(
        projects,
        defaultProjectId,
        initialValues?.projectIds,
      ),
      yesterday: initialValues?.yesterday ?? "",
      today: initialValues?.today ?? "",
      blockers: initialValues?.blockers ?? "None",
    });
  }, [initialValues, defaultProjectId, projects, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Projects</Label>
        <p className="text-xs text-muted-foreground">
          Select every project you worked on today.
        </p>
        <Controller
          name="projectIds"
          control={control}
          render={({ field }) => (
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50/50 p-2">
              {projects.map((project) => {
                const checked = field.value.includes(project.id);
                return (
                  <label
                    key={project.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-white",
                      checked && "bg-white shadow-sm",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...field.value, project.id]
                          : field.value.filter((id) => id !== project.id);
                        field.onChange(next);
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {project.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        />
        {errors.projectIds && (
          <p className="text-sm text-destructive">{errors.projectIds.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="yesterday">What did you do yesterday?</Label>
        <Textarea id="yesterday" rows={3} {...register("yesterday")} />
        {errors.yesterday && (
          <p className="text-sm text-destructive">{errors.yesterday.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="today">What will you do today?</Label>
        <Textarea id="today" rows={3} {...register("today")} />
        {errors.today && (
          <p className="text-sm text-destructive">{errors.today.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockers">Blockers</Label>
        <Textarea id="blockers" rows={2} {...register("blockers")} />
      </div>
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
