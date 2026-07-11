"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { leavePolicyApi } from "@/lib/api/leavePolicy";
import type { LeavePolicy } from "@/types/leave-policy";

interface LeavePolicyDeleteModalProps {
  policy: LeavePolicy;
  onClose: () => void;
  onDeleted: () => void;
}

export function LeavePolicyDeleteModal({
  policy,
  onClose,
  onDeleted,
}: LeavePolicyDeleteModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await leavePolicyApi.deleteLeavePolicy(policy.uuid);
      toast.success("Leave policy deleted successfully.");
      onDeleted();
    } catch {
      toast.error("Failed to delete leave policy. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        <h2 className="font-display text-lg font-bold text-on-surface">
          Delete Leave Policy
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Are you sure you want to delete{" "}
          <span className="font-medium text-on-surface">{policy.name}</span>? This
          policy will no longer be available.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-ds-error px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
