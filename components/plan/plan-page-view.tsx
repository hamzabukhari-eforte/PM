"use client";

import { ProjectPlanView } from "@/components/plan/project-plan-view";
import { useResolvedProjectId } from "@/lib/hooks/use-route-ids";

export function ProjectPlanPageView() {
  const projectId = useResolvedProjectId();
  return <ProjectPlanView projectId={projectId} />;
}
