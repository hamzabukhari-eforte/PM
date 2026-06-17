import { StandupGate } from "@/components/standup/standup-gate";
import { sprintStaticParams } from "@/lib/static-paths";
import { BoardView } from "./board-view";

export function generateStaticParams() {
  return sprintStaticParams();
}

export default function BoardPage() {
  return (
    <StandupGate>
      <BoardView />
    </StandupGate>
  );
}
