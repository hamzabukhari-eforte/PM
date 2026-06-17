import { projectStaticParams } from "@/lib/static-paths";
import { ReportsView } from "./reports-view";

export function generateStaticParams() {
  return projectStaticParams();
}

export default function ReportsPage() {
  return <ReportsView />;
}
