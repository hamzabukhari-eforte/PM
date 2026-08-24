"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { PROJECT_SCOPED_PATHS } from "@/lib/navigation/screen-paths";
import { cn } from "@/lib/utils";

function shouldShowProjectSwitcher(pathname: string): boolean {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return PROJECT_SCOPED_PATHS.has(normalized);
}

export function AppHeader({
  title,
  description,
  actions,
  showProjectSwitcher,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Override auto visibility (shown on project-scoped screens only). */
  showProjectSwitcher?: boolean;
}) {
  const pathname = usePathname();
  const showSwitcher =
    showProjectSwitcher ?? shouldShowProjectSwitcher(pathname);

  return (
    <header className="relative w-full border-b border-slate-200/80 bg-white/90 px-6 py-2 backdrop-blur-md lg:px-8">
      <div className="flex min-h-9 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold leading-none tracking-tight text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex shrink-0 flex-wrap items-center justify-end gap-2",
          )}
        >
          {showSwitcher && <ProjectSwitcher />}
          {actions}
        </div>
      </div>
    </header>
  );
}
