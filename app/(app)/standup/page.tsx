import { Suspense } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { StandupView } from "./standup-view";

export default function StandupPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <StandupView />
    </Suspense>
  );
}
