"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userApi } from "@/lib/api/user";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const changePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface SecurityFormProps {
  userUuid: string;
}

export function SecurityForm({ userUuid }: SecurityFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setIsSaving(true);
    try {
      await userApi.changePassword(userUuid, data);
      toast.success("Password updated successfully.");
      reset();
    } catch {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Security
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
        <h3 className="font-display text-sm font-semibold text-on-surface">
          Change Password
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className={FIELD_LABEL}>
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              className={FIELD_INPUT}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-ds-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="password_confirmation" className={FIELD_LABEL}>
              Confirm New Password
            </Label>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="Re-enter new password"
              className={FIELD_INPUT}
              {...register("password_confirmation")}
            />
            {errors.password_confirmation && (
              <p className="text-xs text-ds-error">
                {errors.password_confirmation.message}
              </p>
            )}
          </div>
        </div>

        {/* Update Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
