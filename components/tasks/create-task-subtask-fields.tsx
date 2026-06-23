"use client";

import { useFieldArray, Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { GripVertical, Link2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectMember } from "@/lib/api/types";
import type { LinkTarget } from "@/lib/utils/task-hierarchy";
import { MemberMultiSelect } from "@/components/ui/member-multi-select";
import { cn } from "@/lib/utils";
import type { CreateTaskFormData } from "@/components/tasks/create-task-form-schema";

export function SubtaskFieldRow({
  path,
  index,
  depth,
  control,
  register,
  errors,
  linkTargets,
  members,
  onRemove,
}: {
  path: string;
  index: number;
  depth: number;
  control: Control<CreateTaskFormData>;
  register: UseFormRegister<CreateTaskFormData>;
  errors: FieldErrors<CreateTaskFormData>;
  linkTargets: LinkTarget[];
  members: ProjectMember[];
  onRemove: () => void;
}) {
  const childPath = `${path}.subtasks`;
  const titlePath = `${path}.title` as const;
  const idPath = `${path}.id` as const;
  const descriptionPath = `${path}.description` as const;
  const linkPath = `${path}.linkedTaskId` as const;
  const assigneesPath = `${path}.assigneeIds` as const;
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
            name={assigneesPath as "subtasks.0.assigneeIds"}
            control={control}
            render={({ field }) => (
              <MemberMultiSelect
                members={members}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Assign subtask…"
              />
            )}
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
            members={members}
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

export function SubtaskFieldList({
  path,
  depth,
  control,
  register,
  errors,
  linkTargets,
  members,
}: {
  path: string;
  depth: number;
  control: Control<CreateTaskFormData>;
  register: UseFormRegister<CreateTaskFormData>;
  errors: FieldErrors<CreateTaskFormData>;
  linkTargets: LinkTarget[];
  members: ProjectMember[];
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
          members={members}
          onRemove={() => remove(index)}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => append({ title: "", description: "", assigneeIds: [], subtasks: [] })}
      >
        <Plus className="h-3.5 w-3.5" />
        {depth === 0 ? "Add subtask" : "Add child"}
      </Button>
    </div>
  );
}
