"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoadingState } from "@/components/ui/loading-state";
import { BASE_PATH } from "@/lib/base-path";

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const path = isAuthenticated() ? "/dashboard/" : "/login/";
    window.location.replace(`${BASE_PATH}${path}`);
  }, [isAuthenticated]);

  return <LoadingState />;
}
