"use client";

import { useParams } from "next/navigation";
import { ProjectPlanView } from "@/components/plan/project-plan-view";

export function ProjectPlanPageView() {
  const params = useParams<{ projectId: string }>();
  return <ProjectPlanView projectId={params.projectId} />;
}
