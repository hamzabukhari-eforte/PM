"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { LoginHeroPanel } from "@/components/auth/login-hero-panel";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard/");
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <LoginHeroPanel />
      <main className="flex flex-1 items-center justify-center bg-[#f4f6fb] px-6 py-10 lg:px-12">
        <LoginForm />
      </main>
    </div>
  );
}
