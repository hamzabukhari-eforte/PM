"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  storyPoints: z.string().optional(),
  assigneeId: z.string().optional(),
});

export type CreateTaskFormData = {
  title: string;
  description?: string;
  storyPoints?: string;
  assigneeId?: string;
};

export function CreateTaskForm({
  members,
  onSubmit,
  onCancel,
  loading,
  submitLabel = "Create task",
}: {
  members: ProjectMember[];
  onSubmit: (data: CreateTaskFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(schema),
    defaultValues: { assigneeId: "unassigned" },
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          ...data,
          assigneeId: data.assigneeId === "unassigned" ? undefined : data.assigneeId,
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
