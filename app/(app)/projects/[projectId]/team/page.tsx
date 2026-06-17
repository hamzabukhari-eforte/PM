import { projectStaticParams } from "@/lib/static-paths";
import { TeamView } from "./team-view";

export function generateStaticParams() {
  return projectStaticParams();
}

export default function TeamPage() {
  return <TeamView />;
}
