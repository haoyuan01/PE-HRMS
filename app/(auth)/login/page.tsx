"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Cloud, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { APP_NAME, APP_TAGLINE, ROUTES } from "@/lib/constants";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({
        ...data,
        keepLoggedIn,
      });
      setUser(response.data.user);
      // Mirror the permission codes the server stored in the cookie so gated UI
      // works immediately after login (before any cold reload / session fetch).
      const codes = (response.data.user.roles ?? []).flatMap((role) =>
        (role.permissions ?? []).map((p) => p.code)
      );
      useAuthStore.getState().setPermissions(codes);
      router.push(ROUTES.DASHBOARD);
    } catch {
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low">
          <Cloud className="h-6 w-6 text-ds-primary" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
            {APP_NAME}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {APP_TAGLINE}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)] sm:p-8">
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold tracking-tight text-on-surface">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Enter your credentials to access the workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-widest text-on-surface-variant"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-ds-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-widest text-on-surface-variant"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="border-0 bg-surface-container-low py-3 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-ds-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Keep me logged in + Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="keep-logged-in"
                checked={keepLoggedIn}
                onCheckedChange={(checked) =>
                  setKeepLoggedIn(checked === true)
                }
                className="size-[18px] rounded border-2 border-on-surface-variant/40 data-checked:border-ds-primary data-checked:bg-ds-primary data-checked:text-white"
              />
              <label
                htmlFor="keep-logged-in"
                className="text-sm text-on-surface cursor-pointer select-none"
              >
                Keep me logged in
              </label>
            </div>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-semibold text-ds-primary hover:text-ds-primary-dim hover:underline underline-offset-2 transition-all"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In to Workspace"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
