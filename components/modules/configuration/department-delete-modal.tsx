"use client";

import { useState, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DepartmentDeleteModalProps {
  open: boolean;
  departmentName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DepartmentDeleteModal({
  open,
  departmentName,
  onClose,
  onConfirm,
}: DepartmentDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ds-error/10">
            <AlertTriangle className="h-5 w-5 text-ds-error" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">
              Delete Department
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Are you sure you want to delete
              {departmentName ? (
                <>
                  {" "}
                  <span className="font-medium text-on-surface">
                    {departmentName}
                  </span>
                </>
              ) : (
                " this department"
              )}
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-ds-error px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
