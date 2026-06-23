import { projectStaticParams } from "@/lib/static-paths";
import { ReportsView } from "@/components/reports/reports-view";

export function generateStaticParams() {
  return projectStaticParams();
}

export default function ReportsPage() {
  return <ReportsView />;
}
