"use client";

import { useParams, useSearchParams } from "next/navigation";
import { STATIC_PLACEHOLDER } from "@/lib/static-paths";

/**
 * Resolves the real project id for static-export routes.
 * Prebuilt IDs come from the path; runtime-created IDs from `?id=`.
 */
export function useResolvedProjectId(): string {
  const params = useParams<{ projectId?: string }>();
  const searchParams = useSearchParams();
  const fromPath = params.projectId;
  const fromQuery = searchParams.get("id");

  if (fromPath && fromPath !== STATIC_PLACEHOLDER) return fromPath;
  return fromQuery ?? fromPath ?? "";
}

/**
 * Resolves the real sprint id for static-export routes.
 * Prebuilt IDs come from the path; runtime-created IDs from `?sprintId=`.
 */
export function useResolvedSprintId(): string {
  const params = useParams<{ sprintId?: string }>();
  const searchParams = useSearchParams();
  const fromPath = params.sprintId;
  const fromQuery = searchParams.get("sprintId");

  if (fromPath && fromPath !== STATIC_PLACEHOLDER) return fromPath;
  return fromQuery ?? fromPath ?? "";
}
