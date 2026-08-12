"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { userApi } from "@/lib/api/user";

interface PayslipPinModalProps {
  onClose: () => void;
  // Called once the entered PIN is verified.
  onVerified: () => void;
}

export function PayslipPinModal({ onClose, onVerified }: PayslipPinModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [passcode, setPasscode] = useState("");
  const [show, setShow] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(passcode)) {
      setError("PIN must be 6 digits.");
      return;
    }
    setIsChecking(true);
    setError(null);
    try {
      await userApi.checkPasscode(passcode);
      onVerified();
    } catch {
      setError("Incorrect PIN. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const onForgot = async () => {
    setIsSendingReset(true);
    try {
      await userApi.forgotPasscode();
      toast.success("A PIN reset link has been sent to your email.");
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ds-primary/10">
            <Lock className="h-5 w-5 text-ds-primary" />
          </div>
          <h2 className="mt-3 font-display text-lg font-bold text-on-surface">
            Enter your PIN
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Confirm your 6-digit PIN to view this payslip.
          </p>
        </div>

        <div className="mt-5">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              inputMode="numeric"
              maxLength={6}
              autoFocus
              placeholder="Enter 6-digit PIN"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value.replace(/\D/g, ""));
                if (error) setError(null);
              }}
              className="h-11 w-full rounded-lg border-0 bg-surface-container-low px-4 pr-11 text-center text-lg tracking-[0.5em] text-on-surface placeholder:text-sm placeholder:tracking-normal placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide PIN" : "Show PIN"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-ds-error">{error}</p>}
          <button
            type="button"
            onClick={onForgot}
            disabled={isSendingReset}
            className="mt-2 text-xs font-medium text-ds-primary transition-colors hover:text-ds-primary-dim disabled:opacity-50"
          >
            {isSendingReset ? "Sending..." : "Forgot PIN?"}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isChecking}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-5 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}
