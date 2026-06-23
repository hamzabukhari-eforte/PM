import { projectStaticParams } from "@/lib/static-paths";
import { ProjectPlanPageView } from "@/components/plan/plan-page-view";

export function generateStaticParams() {
  return projectStaticParams();
}

export default function ProjectPlanPage() {
  return <ProjectPlanPageView />;
}
