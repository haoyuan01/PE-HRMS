"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { KeyRound, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      // TODO: Call forgot password API endpoint
      // await authApi.forgotPassword(data.email);
      console.log("Forgot password request for:", data.email);
      setIsSubmitted(true);
      toast.success("Reset link sent! Check your email.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      {/* Form Card */}
      <div className="w-full rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low">
            <KeyRound className="h-5 w-5 text-ds-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="font-display text-xl font-bold tracking-tight text-on-surface">
            Reset Password
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            Enter the email address associated with your account and we&apos;ll
            send you a link to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-5">
            <p className="text-center text-sm text-on-surface-variant">
              If an account exists with that email, you&apos;ll receive a
              password reset link shortly.
            </p>
            <Link
              href={ROUTES.LOGIN}
              className="flex w-full items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-widest text-on-surface-variant"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-ds-error">
                  {errors.email.message}
                </p>
              )}
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
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        {!isSubmitted && (
          <div className="mt-5 flex justify-center">
            <Link
              href={ROUTES.LOGIN}
              className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-ds-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
