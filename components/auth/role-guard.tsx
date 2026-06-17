"use client";

import type { Role } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/auth-store";

export function RoleGuard({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
