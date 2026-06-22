"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContent({
  children,
  className,
  width = "full",
}: {
  children: ReactNode;
  className?: string;
  /** `form` caps width for long forms but stays left-aligned (not centered). */
  width?: "full" | "form";
}) {
  return (
    <div
      className={cn(
        "page-enter w-full min-w-0 space-y-6 p-6 lg:px-8 lg:py-8 xl:px-10",
        width === "form" && "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
