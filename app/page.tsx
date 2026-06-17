"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoadingState } from "@/components/ui/loading-state";

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    router.replace(isAuthenticated() ? "/dashboard/" : "/login/");
  }, [router, isAuthenticated]);

  return <LoadingState />;
}
