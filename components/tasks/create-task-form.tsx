"use client";

import { useFieldArray, useForm, Controller, type Control, type FieldErrors, type Resolver, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GripVertical, Link2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { ProjectMember } from "@/lib/api/types";
import type { LinkTarget, SubtaskFormItem } from "@/lib/utils/task-hierarchy";
import { cn } from "@/lib/utils";

const subtaskSchema: z.ZodType<SubtaskFormItem> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Subtask title is required"),
    description: z.string().optional(),
    linkedTaskId: z.string().optional(),
    subtasks: z.array(subtaskSchema).optional(),
  }),
);

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  storyPoints: z.string().optional(),
  assigneeId: z.string().optional(),
  subtasks: z.array(subtaskSchema).optional(),
});

export type CreateTaskFormData = {
  title: string;
  description?: string;
  storyPoints?: string;
  assigneeId?: string;
  subtasks?: SubtaskFormItem[];
};

function filterSubtasks(subtasks: SubtaskFormItem[] | undefined): SubtaskFormItem[] | undefined {
  if (!subtasks) return undefined;
  return subtasks
    .filter((sub) => sub.title.trim())
    .map((sub) => ({
      ...sub,
      subtasks: filterSubtasks(sub.subtasks),
    }));
}

function SubtaskFieldRow({
  path,
  index,
  depth,
  control,
  register,
  errors,
  linkTargets,
  onRemove,
}: {
  path: string;
  index: number;
  depth: number;
  control: Control<CreateTaskFormData>;
  register: UseFormRegister<CreateTaskFormData>;
  errors: FieldErrors<CreateTaskFormData>;
  linkTargets: LinkTarget[];
  onRemove: () => void;
}) {
  const childPath = `${path}.subtasks`;

  const titlePath = `${path}.title` as const;
  const idPath = `${path}.id` as const;
  const descriptionPath = `${path}.description` as const;
  const linkPath = `${path}.linkedTaskId` as const;

  const topLevelIndex = Number(path.split(".")[1] ?? index);
  const rowErrors = depth === 0 ? errors.subtasks?.[topLevelIndex] : undefined;

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-3",
        depth > 0 && "ml-4 border-l-2 border-l-blue-100",
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <input type="hidden" {...register(idPath as "subtasks.0.id")} />
          <Input
            placeholder={depth === 0 ? `Subtask ${index + 1} title` : "Child subtask title"}
            {...register(titlePath as "subtasks.0.title")}
          />
          {rowErrors?.title && (
            <p className="text-xs text-destructive">{rowErrors.title.message}</p>
          )}
          <Textarea
            rows={2}
            placeholder="Description (optional)"
            className="text-sm"
            {...register(descriptionPath as "subtasks.0.description")}
          />
          <Controller
            name={linkPath as "subtasks.0.linkedTaskId"}
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? "none"}
                onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Link to task (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No link</SelectItem>
                  {linkTargets.map((target) => (
                    <SelectItem key={target.id} value={target.id}>
                      <span className="flex items-center gap-1.5">
                        <Link2 className="h-3 w-3 opacity-60" />
                        {target.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <SubtaskFieldList
            path={childPath}
            depth={depth + 1}
            control={control}
            register={register}
            errors={errors}
            linkTargets={linkTargets}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600"
          onClick={onRemove}
          aria-label="Remove subtask"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SubtaskFieldList({
  path,
  depth,
  control,
  register,
  errors,
  linkTargets,
}: {
  path: string;
  depth: number;
  control: Control<CreateTaskFormData>;
  register: UseFormRegister<CreateTaskFormData>;
  errors: FieldErrors<CreateTaskFormData>;
  linkTargets: LinkTarget[];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: path as "subtasks",
  });

  return (
    <div className={cn("space-y-2", depth > 0 && "mt-2")}>
      {fields.map((field, index) => (
        <SubtaskFieldRow
          key={field.id}
          path={`${path}.${index}`}
          index={index}
          depth={depth}
          control={control}
          register={register}
          errors={errors}
          linkTargets={linkTargets}
          onRemove={() => remove(index)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => append({ title: "", description: "", subtasks: [] })}
      >
        <Plus className="h-3.5 w-3.5" />
        {depth === 0 ? "Add subtask" : "Add child"}
      </Button>
    </div>
  );
}

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
    resolver: zodResolver(schema) as Resolver<CreateTaskFormData>,
    defaultValues: defaultValues ?? {
      assigneeId: "unassigned",
      subtasks: [],
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          ...data,
          assigneeId: data.assigneeId === "unassigned" ? undefined : data.assigneeId,
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
          <Label>Assignee</Label>
          <Controller
            name="assigneeId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
