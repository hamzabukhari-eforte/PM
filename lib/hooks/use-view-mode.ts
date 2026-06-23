"use client";

import { useEffect, useState } from "react";
import type { ViewMode } from "@/components/ui/view-mode-toggle";

export function useViewMode(storageKey: string, defaultMode: ViewMode = "cards") {
  const [mode, setMode] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === "cards" || stored === "table") {
      setMode(stored);
    }
  }, [storageKey]);

  function updateMode(next: ViewMode) {
    setMode(next);
    localStorage.setItem(storageKey, next);
  }

  return [mode, updateMode] as const;
}
