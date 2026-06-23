"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectMember } from "@/lib/api/types";
import type { LinkTarget } from "@/lib/utils/task-hierarchy";
import { MemberMultiSelect } from "@/components/ui/member-multi-select";
import {
  createTaskFormSchema,
  filterSubtasks,
  type CreateTaskFormData,
} from "@/components/tasks/create-task-form-schema";
import { SubtaskFieldList } from "@/components/tasks/create-task-subtask-fields";

export type { CreateTaskFormData } from "@/components/tasks/create-task-form-schema";

export function CreateTaskForm({
  members,
  linkTargets = [],
  defaultValues,
  onSubmit,
  onCancel,
  loading,
  submitLabel = "Create task",
  loadingLabel = "Creating…",
}: {
  members: ProjectMember[];
  linkTargets?: LinkTarget[];
  defaultValues?: CreateTaskFormData;
  onSubmit: (data: CreateTaskFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskFormSchema) as Resolver<CreateTaskFormData>,
    defaultValues: defaultValues ?? {
      assigneeIds: [],
      subtasks: [],
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          ...data,
          assigneeIds: data.assigneeIds?.length ? data.assigneeIds : undefined,
          subtasks: filterSubtasks(data.subtasks),
        }),
      )}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="What needs to be done?" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Optional details…"
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="storyPoints">Story points</Label>
          <Input
            id="storyPoints"
            type="number"
            min={0}
            placeholder="e.g. 3"
            {...register("storyPoints")}
          />
        </div>
        <div className="space-y-2">
          <Label>Assignees</Label>
          <Controller
            name="assigneeIds"
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
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div>
          <Label className="text-sm">Subtasks</Label>
          <p className="text-xs text-slate-500">
            Nest subtasks without limit. Use &ldquo;Add child&rdquo; for sub-subtasks. Links use stable ids — numbers update when reordered.
          </p>
        </div>
        <SubtaskFieldList
          path="subtasks"
          depth={0}
          control={control}
          register={register}
          errors={errors}
          linkTargets={linkTargets}
          members={members}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? loadingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
