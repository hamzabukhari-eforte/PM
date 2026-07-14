import { Suspense } from "react";
import { LoadingState } from "@/components/ui/loading-state";

export default function ProjectIdLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>;
}
