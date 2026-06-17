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
  CreateTaskForm,
  type CreateTaskFormData,
} from "@/components/tasks/create-task-form";
import type { ProjectMember } from "@/lib/api/types";

export function AddTaskDialog({
  members,
  columnLabel,
  onSubmit,
  loading,
  trigger,
}: {
  members: ProjectMember[];
  columnLabel?: string;
  onSubmit: (data: CreateTaskFormData) => void;
  loading?: boolean;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  function handleSubmit(data: CreateTaskFormData) {
    onSubmit(data);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>
            {columnLabel
              ? `Add a new task to ${columnLabel}.`
              : "Add a new task to this sprint."}
          </DialogDescription>
        </DialogHeader>
        <CreateTaskForm
          members={members}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
