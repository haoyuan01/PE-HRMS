"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

const changePasscodeSchema = z
  .object({
    passcode: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
    passcode_confirmation: z.string().min(1, "Please confirm your new PIN"),
  })
  .refine((data) => data.passcode === data.passcode_confirmation, {
    message: "PINs do not match",
    path: ["passcode_confirmation"],
  });

type ChangePasscodeFormValues = z.infer<typeof changePasscodeSchema>;

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  inputMode?: "numeric";
  maxLength?: number;
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
}

// A masked input with an eye toggle to show/hide its value.
function SecretField({
  id,
  label,
  placeholder,
  error,
  inputMode,
  maxLength,
  registration,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          className={`${FIELD_INPUT} pr-11`}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-ds-error">{error}</p>}
    </div>
  );
}

interface SecurityFormProps {
  userUuid: string;
}

export function SecurityForm({ userUuid }: SecurityFormProps) {
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingPasscode, setIsSavingPasscode] = useState(false);

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const passcodeForm = useForm<ChangePasscodeFormValues>({
    resolver: zodResolver(changePasscodeSchema),
    defaultValues: { passcode: "", passcode_confirmation: "" },
  });

  const onSubmitPassword = async (data: ChangePasswordFormValues) => {
    setIsSavingPassword(true);
    try {
      await userApi.changePassword(userUuid, data);
      toast.success("Password updated successfully.");
      passwordForm.reset();
    } catch {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const onSubmitPasscode = async (data: ChangePasscodeFormValues) => {
    setIsSavingPasscode(true);
    try {
      await userApi.changePasscode(userUuid, data);
      toast.success("PIN updated successfully.");
      passcodeForm.reset();
    } catch {
      toast.error("Failed to update PIN. Please try again.");
    } finally {
      setIsSavingPasscode(false);
    }
  };

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6 md:p-8">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Security
      </h2>

      {/* Change Password */}
      <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="mt-6">
        <h3 className="font-display text-sm font-semibold text-on-surface">
          Change Password
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <SecretField
            id="password"
            label="New Password"
            placeholder="Enter new password"
            error={passwordForm.formState.errors.password?.message}
            registration={passwordForm.register("password")}
          />
          <SecretField
            id="password_confirmation"
            label="Confirm New Password"
            placeholder="Re-enter new password"
            error={passwordForm.formState.errors.password_confirmation?.message}
            registration={passwordForm.register("password_confirmation")}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSavingPassword}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSavingPassword ? (
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

      {/* Divider */}
      <div className="my-8 border-t border-outline-variant/20" />

      {/* Change PIN */}
      <form onSubmit={passcodeForm.handleSubmit(onSubmitPasscode)}>
        <h3 className="font-display text-sm font-semibold text-on-surface">
          Change PIN
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <SecretField
            id="passcode"
            label="New PIN"
            placeholder="Enter 6-digit PIN"
            inputMode="numeric"
            maxLength={6}
            error={passcodeForm.formState.errors.passcode?.message}
            registration={passcodeForm.register("passcode")}
          />
          <SecretField
            id="passcode_confirmation"
            label="Confirm New PIN"
            placeholder="Re-enter 6-digit PIN"
            inputMode="numeric"
            maxLength={6}
            error={passcodeForm.formState.errors.passcode_confirmation?.message}
            registration={passcodeForm.register("passcode_confirmation")}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSavingPasscode}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSavingPasscode ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update PIN"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
