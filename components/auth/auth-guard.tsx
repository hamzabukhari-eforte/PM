"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoadingState } from "@/components/ui/loading-state";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && !isAuthenticated()) {
      router.replace("/login/");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) return <LoadingState />;
  if (!isAuthenticated()) return <LoadingState label="Redirecting…" />;

  return <>{children}</>;
}
