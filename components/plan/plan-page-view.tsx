"use client";

import { ProjectPlanView } from "@/components/plan/project-plan-view";
import { LoadingState } from "@/components/ui/loading-state";
import { useRequireProjectId } from "@/lib/hooks/use-project-context";

export function ProjectPlanPageView() {
  const projectId = useRequireProjectId();
  if (!projectId) return <LoadingState label="Select a project…" />;
  return <ProjectPlanView projectId={projectId} />;
}
