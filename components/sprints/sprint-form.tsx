"use client";

import { useForm } from "react-hook-form";
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
import { Controller } from "react-hook-form";

const schema = z.object({
  name: z.string().min(1),
  goal: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(["planned", "active", "closed"]),
});

export type SprintFormData = z.infer<typeof schema>;

export function SprintForm({
  onSubmit,
  loading,
}: {
  onSubmit: (data: SprintFormData) => void;
  loading?: boolean;
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<SprintFormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "planned" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-lg gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Sprint name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">Goal</Label>
        <Textarea id="goal" {...register("goal")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : "Create sprint"}
      </Button>
    </form>
  );
}
