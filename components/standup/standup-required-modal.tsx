"use client";

import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StandupForm, type StandupFormData } from "@/components/standup/standup-form";
import { LoadingState } from "@/components/ui/loading-state";
import type { Project } from "@/lib/api/types";

export function StandupRequiredModal({
  open,
  projects,
  defaultProjectId,
  onSubmit,
  loading,
  projectsLoading,
}: {
  open: boolean;
  projects: Project[];
  defaultProjectId?: string;
  onSubmit: (data: StandupFormData) => void;
  loading?: boolean;
  projectsLoading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent forced className="max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <DialogTitle>Daily standup required</DialogTitle>
          <DialogDescription>
            Please answer all three questions before continuing. This helps your
            team stay aligned.
          </DialogDescription>
        </DialogHeader>
        {projectsLoading ? (
          <LoadingState label="Loading projects…" />
        ) : (
          <StandupForm
            projects={projects}
            defaultProjectId={defaultProjectId}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel="Submit & continue"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
