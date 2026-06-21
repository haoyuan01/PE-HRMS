"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const PIN_LENGTH = 6;

interface RoleDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
  onForgotPin: () => Promise<void>;
}

export function RoleDeleteModal({
  open,
  onClose,
  onConfirm,
  onForgotPin,
}: RoleDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [digits, setDigits] = useState<string[]>(() =>
    Array(PIN_LENGTH).fill("")
  );
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  if (!open) return null;

  const reset = () => setDigits(Array(PIN_LENGTH).fill(""));

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const setDigit = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      setDigit(index, "");
      return;
    }
    // Support pasting / typing multiple digits at once.
    const chars = value.split("");
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < chars.length && index + i < PIN_LENGTH; i++) {
        next[index + i] = chars[i];
      }
      return next;
    });
    const nextIndex = Math.min(index + chars.length, PIN_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(digits.join(""));
      reset();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForgotPin = async () => {
    setIsResetting(true);
    try {
      await onForgotPin();
      reset();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        <h2 className="font-display text-lg font-bold text-on-surface">
          Delete Role
        </h2>
        <p className="mt-2 text-sm font-medium text-on-surface">
          Confirm Delete?
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          Deleting this role will remove all associated permissions, and affect
          all assigned users. This may result in loss of access to system
          features. Please ensure this action is intended.
        </p>

        {/* Security PIN */}
        <div className="mt-5">
          <label className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            Security PIN
          </label>
          <div className="mt-2 flex items-center justify-between gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={PIN_LENGTH}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isDeleting}
                className="h-11 w-11 rounded-lg border border-outline-variant/40 bg-surface-container-low text-center text-lg font-semibold text-on-surface focus:border-ds-primary focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all disabled:opacity-50"
              />
            ))}
          </div>
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={handleForgotPin}
              disabled={isResetting || isDeleting}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ds-primary transition-colors hover:text-ds-primary-dim disabled:opacity-50"
            >
              {isResetting && <Loader2 className="h-3 w-3 animate-spin" />}
              Forgot PIN?
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || isResetting || digits.join("").length < PIN_LENGTH}
            className="flex items-center gap-2 rounded-lg bg-ds-error px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
