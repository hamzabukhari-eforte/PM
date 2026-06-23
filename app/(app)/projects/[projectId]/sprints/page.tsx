import { projectStaticParams } from "@/lib/static-paths";
import { SprintsView } from "@/components/sprints/sprints-view";

export function generateStaticParams() {
  return projectStaticParams();
}

export default function SprintsPage() {
  return <SprintsView />;
}
