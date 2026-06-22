"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DateTimePickerField } from "@/components/ui/date-time-picker-field";
import type { PlanTask, ProjectMember, ProjectPlan } from "@/lib/api/types";
import {
  fromTicketDateTimePickerValue,
  toTicketDateTimePickerValue,
} from "@/lib/utils/ticket-datetime";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  timelineStart: z.string().optional(),
  timelineEnd: z.string().optional(),
  isDependent: z.boolean().optional(),
  dependentTaskCode: z.string().optional(),
  isMilestone: z.boolean().optional(),
  milestoneNo: z.string().optional(),
  milestoneDescription: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function nextCode(nodes: PlanTask[], parentId: string | null): string {
  if (!parentId) {
    return String(nodes.length + 1);
  }
  function findParent(list: PlanTask[]): PlanTask | null {
    for (const n of list) {
      if (n.id === parentId) return n;
      const found = n.subtasks ? findParent(n.subtasks) : null;
      if (found) return found;
    }
    return null;
  }
  const parent = findParent(nodes);
  const count = parent?.subtasks?.length ?? 0;
  return parent ? `${parent.code}.${count + 1}` : String(count + 1);
}

function findParentId(nodes: PlanTask[], childId: string, parent: string | null = null): string | null {
  for (const n of nodes) {
    if (n.id === childId) return parent;
    if (n.subtasks?.length) {
      const found = findParentId(n.subtasks, childId, n.id);
      if (found !== null) return found;
    }
  }
  return null;
}

function flattenPlanTasks(nodes: PlanTask[]): PlanTask[] {
  const out: PlanTask[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.subtasks?.length) out.push(...flattenPlanTasks(n.subtasks));
  }
  return out;
}

function collectSubtreeIds(node: PlanTask): Set<string> {
  const ids = new Set<string>([node.id]);
  for (const child of node.subtasks ?? []) {
    for (const id of collectSubtreeIds(child)) ids.add(id);
  }
  return ids;
}

function dependencyOptions(plan: ProjectPlan, editingNode: PlanTask | null): PlanTask[] {
  const all = flattenPlanTasks(plan.nodes);
  if (!editingNode) return all;
  const exclude = collectSubtreeIds(editingNode);
  return all.filter((t) => !exclude.has(t.id));
}

function upsertNode(
  nodes: PlanTask[],
  parentId: string | null,
  node: PlanTask,
  isEdit: boolean,
): PlanTask[] {
  if (!parentId) {
    if (isEdit) {
      return nodes.map((n) =>
        n.id === node.id
          ? node
          : {
              ...n,
              subtasks: n.subtasks ? upsertNode(n.subtasks, parentId, node, true) : n.subtasks,
            },
      );
    }
    return [...nodes, node];
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      const subs = n.subtasks ?? [];
      if (isEdit) {
        return { ...n, subtasks: subs.map((s) => (s.id === node.id ? node : s)) };
      }
      return { ...n, subtasks: [...subs, node] };
    }
    if (n.subtasks?.length) {
      return { ...n, subtasks: upsertNode(n.subtasks, parentId, node, isEdit) };
    }
    return n;
  });
}

export function PlanTaskDialog({
  open,
  onOpenChange,
  plan,
  editingNode,
  parentId,
  members,
  loading,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: ProjectPlan;
  editingNode: PlanTask | null;
  parentId: string | null;
  members: ProjectMember[];
  loading?: boolean;
  onSave: (plan: ProjectPlan) => void;
}) {
  const isEdit = !!editingNode;

  const { register, handleSubmit, control, watch, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isDependent: false, isMilestone: false },
  });

  const isDependent = watch("isDependent");
  const isMilestone = watch("isMilestone");
  const dependencyCandidates = dependencyOptions(plan, editingNode);

  useEffect(() => {
    if (editingNode) {
      reset({
        title: editingNode.title,
        description: editingNode.description,
        assigneeId: editingNode.assigneeId ?? "",
        timelineStart: toTicketDateTimePickerValue(editingNode.timelineStart),
        timelineEnd: toTicketDateTimePickerValue(editingNode.timelineEnd),
        isDependent: editingNode.isDependent,
        dependentTaskCode: editingNode.dependentTaskCode ?? "",
        isMilestone: editingNode.isMilestone,
        milestoneNo: editingNode.milestoneNo ?? "",
        milestoneDescription: editingNode.milestoneDescription ?? "",
      });
    } else {
      reset({
        title: "",
        description: "",
        assigneeId: "",
        timelineStart: "",
        timelineEnd: "",
        isDependent: false,
        dependentTaskCode: "",
        isMilestone: false,
        milestoneNo: "",
        milestoneDescription: "",
      });
    }
  }, [editingNode, open, reset]);

  function onSubmit(data: FormData) {
    const node: PlanTask = {
      id: editingNode?.id ?? `plan-${Date.now()}`,
      code: editingNode?.code ?? nextCode(plan.nodes, parentId),
      title: data.title,
      description: data.description ?? "",
      kind: parentId ? "subtask" : "task",
      order: editingNode?.order ?? plan.nodes.length,
      assigneeId: data.assigneeId || null,
      memberIds: data.assigneeId ? [data.assigneeId] : [],
      timelineStart: fromTicketDateTimePickerValue(data.timelineStart ?? ""),
      timelineEnd: fromTicketDateTimePickerValue(data.timelineEnd ?? ""),
      isDependent: data.isDependent ?? false,
      dependentTaskCode: data.isDependent ? data.dependentTaskCode ?? null : null,
      isMilestone: data.isMilestone ?? false,
      milestoneNo: data.isMilestone ? data.milestoneNo ?? null : null,
      milestoneDescription: data.isMilestone ? data.milestoneDescription ?? null : null,
      subtasks: editingNode?.subtasks ?? [],
    };

    const effectiveParent = isEdit ? findParentId(plan.nodes, editingNode!.id) : parentId;

    onSave({
      ...plan,
      nodes: upsertNode(plan.nodes, effectiveParent, node, isEdit),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit plan task" : "Add plan task"}</DialogTitle>
          <DialogDescription>
            Task fields match the legacy project schedule form.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task description *</Label>
            <Input id="title" maxLength={100} {...register("title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Task details</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="timelineStart"
              control={control}
              render={({ field }) => (
                <DateTimePickerField id="timelineStart" label="Start" value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
            <Controller
              name="timelineEnd"
              control={control}
              render={({ field }) => (
                <DateTimePickerField id="timelineEnd" label="End" value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Task leader</Label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isDependent")} className="h-4 w-4 rounded" />
            Is dependent task?
          </label>
          {isDependent && (
            <div className="space-y-2">
              <Label>Dependent task</Label>
              <Controller
                name="dependentTaskCode"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select predecessor task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select task…</SelectItem>
                      {dependencyCandidates.map((t) => (
                        <SelectItem key={t.id} value={t.code}>
                          {t.code} — {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {dependencyCandidates.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Add other plan tasks first, then choose which this one depends on.
                </p>
              )}
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isMilestone")} className="h-4 w-4 rounded" />
            Is milestone task?
          </label>
          {isMilestone && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="milestoneNo">Milestone no.</Label>
                <Input id="milestoneNo" {...register("milestoneNo")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="milestoneDescription">Milestone description</Label>
                <Input id="milestoneDescription" {...register("milestoneDescription")} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
