import { projectStaticParams } from "@/lib/static-paths";
import { ProjectDetailView } from "./project-detail-view";

export function generateStaticParams() {
  return projectStaticParams();
}

export default function ProjectDetailPage() {
  return <ProjectDetailView />;
}
