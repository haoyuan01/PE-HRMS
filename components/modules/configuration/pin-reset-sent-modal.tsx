"use client";

import { useRef } from "react";
import { MailCheck } from "lucide-react";

interface PinResetSentModalProps {
  open: boolean;
  onClose: () => void;
}

export function PinResetSentModal({ open, onClose }: PinResetSentModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 text-center shadow-[var(--shadow-ambient)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <MailCheck className="h-6 w-6 text-emerald-600" />
        </div>

        <h2 className="mt-4 font-display text-lg font-bold text-on-surface">
          Reset Security PIN Email Sent
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          A security PIN reset email has been sent. Please kindly check your
          personal email inbox.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
