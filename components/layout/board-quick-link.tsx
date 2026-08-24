"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { useProjectBoard } from "@/lib/hooks/use-project-board";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/stores/ui-store";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";

const boardLinkVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      tone: {
        primary:
          "rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:brightness-110 hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:ring-indigo-400 focus-visible:ring-offset-background",
        hero:
          "rounded-xl border border-white/30 bg-white text-indigo-700 shadow-lg shadow-indigo-950/30 hover:border-white/50 hover:bg-indigo-50 hover:text-indigo-800 hover:shadow-xl focus-visible:ring-white/60 focus-visible:ring-offset-indigo-600",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-sm",
      },
    },
    defaultVariants: {
      tone: "primary",
      size: "default",
    },
  },
);

function useOpenBoard(projectId: string) {
  const router = useRouter();
  const setProjectContext = useUiStore((s) => s.setProjectContext);
  const { boardUrl, sprintsUrl, preferredSprintId, sprint, isLoading } = useProjectBoard(projectId);

  function open() {
    setProjectContext(projectId, preferredSprintId);
    router.push(boardUrl ?? sprintsUrl ?? SCREEN_PATHS.sprints);
  }

  return { open, sprint, isLoading, href: boardUrl ?? sprintsUrl ?? SCREEN_PATHS.project };
}

export function BoardQuickLink({
  projectId,
  label = "Open Kanban board",
  tone,
  size,
  className,
  showArrow = true,
}: {
  projectId: string;
  label?: string;
  tone?: VariantProps<typeof boardLinkVariants>["tone"];
  size?: VariantProps<typeof boardLinkVariants>["size"];
  className?: string;
  showArrow?: boolean;
}) {
  const { open, sprint, isLoading } = useOpenBoard(projectId);

  return (
    <button
      type="button"
      onClick={open}
      className={cn(boardLinkVariants({ tone, size }), className)}
    >
      <LayoutGrid className="h-4 w-4 shrink-0" />
      {isLoading ? "Loading…" : sprint ? label : "Set up sprints"}
      {showArrow && !isLoading && <ArrowRight className="h-4 w-4 shrink-0 opacity-70" />}
    </button>
  );
}

export function BoardQuickLinkOutline({
  projectId,
  className,
}: {
  projectId: string;
  className?: string;
}) {
  const { open } = useOpenBoard(projectId);

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.98]",
        className,
      )}
    >
      <LayoutGrid className="h-3.5 w-3.5" />
      Board
    </button>
  );
}

/** Kept for rare Link-based usages that already set context. */
export function BoardQuickLinkAnchor({
  href = SCREEN_PATHS.board,
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm",
        className,
      )}
    >
      <LayoutGrid className="h-3.5 w-3.5" />
      Board
    </Link>
  );
}
