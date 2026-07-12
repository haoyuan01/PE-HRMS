"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { leaveRequestApi } from "@/lib/api/leaveRequest";

interface LeaveReviewModalProps {
  leaveUuid: string;
  approve: boolean;
  role: "manager" | "director";
  onClose: () => void;
  onDone: () => void;
}

export function LeaveReviewModal({
  leaveUuid,
  approve,
  role,
  onClose,
  onDone,
}: LeaveReviewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [remark, setRemark] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const review =
        role === "director"
          ? leaveRequestApi.directorReviewLeaveRequest
          : leaveRequestApi.managerReviewLeaveRequest;
      await review(leaveUuid, approve, remark);
      toast.success(
        approve ? "Leave request approved." : "Leave request rejected."
      );
      onDone();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: unknown } | undefined)
            ?.message as string | undefined)
        : undefined;
      toast.error(
        typeof message === "string"
          ? message
          : `Failed to ${approve ? "approve" : "reject"} leave request.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-on-surface">
            {approve ? "Approve Leave Request" : "Reject Leave Request"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-2 px-6 py-5">
          <label
            htmlFor="review_remark"
            className="text-xs font-medium uppercase tracking-widest text-on-surface-variant"
          >
            Remark
          </label>
          <textarea
            id="review_remark"
            rows={4}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder={
              approve
                ? "Add an optional note for the applicant..."
                : "Explain why this request is rejected..."
            }
            className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-outline-variant/20 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
              approve ? "bg-emerald-600" : "bg-ds-error"
            }`}
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {approve ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
