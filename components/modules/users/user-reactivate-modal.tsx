"use client";

import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface UserReactivateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function UserReactivateModal({
  open,
  onClose,
  onConfirm,
}: UserReactivateModalProps) {
  const [isReactivating, setIsReactivating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      await onConfirm();
    } finally {
      setIsReactivating(false);
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
          Reactivate User
        </h2>

        <p className="mt-3 text-sm text-on-surface-variant">
          Confirm reactivate this account?
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isReactivating}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReactivate}
            disabled={isReactivating}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isReactivating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Reactivating...
              </>
            ) : (
              "Reactivate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
