"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PlanTask, ProjectMember, ProjectPlan } from "@/lib/api/types";
import {
  fromTicketDateTimePickerValue,
  toTicketDateTimePickerValue,
} from "@/lib/utils/ticket-datetime";
import {
  findPlanParentId,
  nextPlanCode,
  planDependencyOptions,
  upsertPlanNode,
} from "@/lib/utils/plan-tree";
import {
  planTaskDialogSchema,
  type PlanTaskDialogFormData,
} from "@/components/plan/plan-task-dialog-schema";
import { PlanTaskDialogFields } from "@/components/plan/plan-task-dialog-fields";

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

  const { register, handleSubmit, control, watch, reset } = useForm<PlanTaskDialogFormData>({
    resolver: zodResolver(planTaskDialogSchema),
    defaultValues: { isDependent: false, isMilestone: false },
  });

  const isDependent = watch("isDependent");
  const isMilestone = watch("isMilestone");
  const dependencyCandidates = planDependencyOptions(plan, editingNode);

  useEffect(() => {
    if (editingNode) {
      reset({
        title: editingNode.title,
        description: editingNode.description,
        memberIds: editingNode.memberIds?.length ? [...editingNode.memberIds] : [],
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
        memberIds: [],
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

  function onSubmit(data: PlanTaskDialogFormData) {
    const memberIds = data.memberIds ?? [];
    const node: PlanTask = {
      id: editingNode?.id ?? `plan-${Date.now()}`,
      code: editingNode?.code ?? nextPlanCode(plan.nodes, parentId),
      title: data.title,
      description: data.description ?? "",
      kind: parentId ? "subtask" : "task",
      order: editingNode?.order ?? plan.nodes.length,
      assigneeId: memberIds[0] ?? null,
      memberIds,
      timelineStart: fromTicketDateTimePickerValue(data.timelineStart ?? ""),
      timelineEnd: fromTicketDateTimePickerValue(data.timelineEnd ?? ""),
      isDependent: data.isDependent ?? false,
      dependentTaskCode: data.isDependent ? data.dependentTaskCode ?? null : null,
      isMilestone: data.isMilestone ?? false,
      milestoneNo: data.isMilestone ? data.milestoneNo ?? null : null,
      milestoneDescription: data.isMilestone ? data.milestoneDescription ?? null : null,
      subtasks: editingNode?.subtasks ?? [],
    };

    const effectiveParent = isEdit ? findPlanParentId(plan.nodes, editingNode!.id) : parentId;

    onSave({
      ...plan,
      nodes: upsertPlanNode(plan.nodes, effectiveParent, node, isEdit),
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
          <PlanTaskDialogFields
            control={control}
            register={register}
            members={members}
            isDependent={!!isDependent}
            isMilestone={!!isMilestone}
            dependencyCandidates={dependencyCandidates}
          />
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
