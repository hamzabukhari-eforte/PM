"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PersonalTaskForm,
  type PersonalTaskFormData,
} from "@/components/tasks/personal-task-form";
import type { CreatePersonalTaskInput, User } from "@/lib/api/types";
import { ticketDateTimeLocalToIso } from "@/lib/utils/ticket-datetime";

export function AddPersonalTaskDialog({
  kind,
  assignees,
  onSubmit,
  loading,
}: {
  kind: "miscellaneous" | "routine";
  assignees: User[];
  onSubmit: (data: CreatePersonalTaskInput) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);

  function handleSubmit(data: PersonalTaskFormData) {
    const timelineStart = ticketDateTimeLocalToIso(data.timelineStart);
    const timelineEnd = ticketDateTimeLocalToIso(data.timelineEnd);
    if (!timelineStart || !timelineEnd) return;

    onSubmit({
      title: data.title,
      description: data.description,
      assigneeIds: data.assigneeIds,
      storyPoints: data.storyPoints ? Number(data.storyPoints) : null,
      kind,
      recurrenceInterval:
        kind === "routine" ? data.recurrenceInterval : undefined,
      timelineStart,
      timelineEnd,
    });
    setOpen(false);
  }

  const label = kind === "routine" ? "routine" : "miscellaneous";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          New {label} task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg overflow-visible">
        <DialogHeader>
          <DialogTitle>
            Create {kind === "routine" ? "routine" : "miscellaneous"} task
          </DialogTitle>
          <DialogDescription>
            Assign to a team member. They will see this task on their Tasks page.
          </DialogDescription>
        </DialogHeader>
        <PersonalTaskForm
          kind={kind}
          assignees={assignees}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
