"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { StandupEntry, StandupWindow } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/auth-store";
import { requiresStandup } from "@/lib/utils/roles";

function isInStandupWindow(window: StandupWindow): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= window.startHour && hour < window.endHour;
}

export function useStandupGate() {
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.user?.role);
  const standupRequired = requiresStandup(role);

  const windowQuery = useQuery({
    queryKey: ["standup", "window"],
    queryFn: () => apiClient<StandupWindow>(endpoints.standup.window),
    enabled: standupRequired,
  });

  const todayQuery = useQuery({
    queryKey: ["standup", "today", userId],
    queryFn: () => apiClient<StandupEntry | null>(endpoints.standup.today),
    enabled: !!userId && standupRequired,
  });

  const window = windowQuery.data ?? {
    startHour: 0,
    endHour: Number(process.env.NEXT_PUBLIC_STANDUP_END_HOUR ?? 10),
    timezone: "UTC",
  };

  const inWindow = standupRequired ? isInStandupWindow(window) : false;
  const submitted = standupRequired ? !!todayQuery.data : true;
  const needsStandup = standupRequired && !submitted;
  const blocked = inWindow && needsStandup;
  const loading =
    standupRequired &&
    (windowQuery.isLoading || (!!userId && todayQuery.isLoading));

  return {
    loading,
    inWindow,
    submitted,
    needsStandup,
    blocked,
    standupRequired,
    todayEntry: todayQuery.data,
    window,
    refetch: todayQuery.refetch,
  };
}
