import { projectStaticParams } from "@/lib/static-paths";
import { ProjectSettingsView } from "@/components/projects/project-settings-view";

export function generateStaticParams() {
  return projectStaticParams();
}

export default function ProjectSettingsPage() {
  return <ProjectSettingsView />;
}
