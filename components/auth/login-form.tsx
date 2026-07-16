"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthResponse } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/auth-store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@agileflow.com", password: "admin123" },
  });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const response = await apiClient<AuthResponse>(endpoints.auth.login, {
        method: "POST",
        body: JSON.stringify(data),
        skipAuth: true,
      });
      setAuth(response.token, response.user);
      router.replace("/dashboard/");
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="login-form-enter w-full max-w-[400px]">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-[1.75rem]">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to your account to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className="h-11 border-slate-200 bg-white pl-10 shadow-sm"
              {...register("email")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-11 border-slate-200 bg-white pl-10 pr-10 shadow-sm"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Remember me
          </label>
          <span className="font-medium text-indigo-600">Demo access below</span>
        </div>

        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="h-11 w-full text-[15px] font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-xs text-slate-500">
        Demo: <span className="font-medium text-slate-700">admin@agileflow.com</span>
        {" / "}
        <span className="font-medium text-slate-700">admin123</span>
      </p>

      <p className="mt-8 text-center text-xs text-slate-400">
        Protected workspace access. Contact your admin if you need an account.
      </p>
    </div>
  );
}
