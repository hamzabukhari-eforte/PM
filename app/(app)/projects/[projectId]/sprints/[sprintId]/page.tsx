import { sprintStaticParams } from "@/lib/static-paths";
import { SprintDetailView } from "./sprint-detail-view";

export function generateStaticParams() {
  return sprintStaticParams();
}

export default function SprintDetailPage() {
  return <SprintDetailView />;
}
