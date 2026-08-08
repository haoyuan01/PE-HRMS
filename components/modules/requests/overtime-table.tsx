"use client";

import { useRef, useState } from "react";
import { Check, Eye, FileText, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { overtimeApi } from "@/lib/api/overtime";
import type { Overtime } from "@/types/overtime";

function formatDate(value: string | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
}

function fileName(url: string) {
  return decodeURIComponent(url.split("/").pop() ?? "attachment");
}

// Overtime is reviewed by the director only.
function overtimeStatus(o: Overtime) {
  if (o.director_action_at) {
    return o.director_approved
      ? { label: "Approved", className: "bg-emerald-500/10 text-emerald-600" }
      : { label: "Rejected", className: "bg-ds-error/10 text-ds-error" };
  }
  return { label: "Pending", className: "bg-amber-500/10 text-amber-600" };
}

function FileLink({ url }: { url: string | null }) {
  if (!url) return <span className="text-sm text-on-surface-variant">—</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
    >
      <FileText className="h-4 w-4" />
      View File
    </a>
  );
}

// Optional-remark confirm modal for a director approve/reject.
function OvertimeReviewModal({
  overtime,
  approve,
  onClose,
  onDone,
}: {
  overtime: Overtime;
  approve: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [remark, setRemark] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const confirm = async () => {
    setIsSaving(true);
    try {
      await overtimeApi.directorReviewOvertime(overtime.uuid, approve, remark);
      toast.success(approve ? "Overtime approved." : "Overtime rejected.");
      onDone();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: unknown } | undefined)
            ?.message as string | undefined)
        : undefined;
      toast.error(
        typeof message === "string"
          ? message
          : `Failed to ${approve ? "approve" : "reject"} overtime.`
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
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-on-surface">
            {approve ? "Approve Overtime" : "Reject Overtime"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2 px-6 py-5">
          <label
            htmlFor="ot_remark"
            className="text-xs font-medium uppercase tracking-widest text-on-surface-variant"
          >
            Remark (optional)
          </label>
          <textarea
            id="ot_remark"
            rows={4}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add an optional note..."
            className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
          />
        </div>
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
            onClick={confirm}
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

function OvertimeDetailModal({
  overtime,
  canReview,
  onClose,
  onReview,
}: {
  overtime: Overtime;
  canReview: boolean;
  onClose: () => void;
  onReview: (approve: boolean) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

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
            Overtime Detail
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
              Remark
            </p>
            <div
              className={`rounded-lg bg-surface-container-low px-4 py-3 text-sm ${
                overtime.description ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              {overtime.description || "—"}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
              File
            </p>
            {overtime.attachment_path ? (
              <a
                href={overtime.attachment_path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3 transition-colors hover:border-ds-primary/40"
              >
                <FileText className="h-5 w-5 shrink-0 text-ds-primary" />
                <span className="truncate text-sm text-ds-primary">
                  {fileName(overtime.attachment_path)}
                </span>
              </a>
            ) : (
              <div className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                No file attached
              </div>
            )}
          </div>
        </div>

        {/* Director review actions */}
        {canReview && (
          <div className="flex items-center justify-end gap-3 border-t border-outline-variant/20 px-6 py-4">
            <button
              type="button"
              onClick={() => onReview(false)}
              className="flex items-center gap-2 rounded-lg border border-ds-error/30 px-4 py-2 text-sm font-medium text-ds-error transition-colors hover:bg-ds-error/10"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => onReview(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Check className="h-4 w-4" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface OvertimeTableProps {
  overtimes: Overtime[];
  isLoading: boolean;
  onReviewed?: () => void;
}

export function OvertimeTable({
  overtimes,
  isLoading,
  onReviewed,
}: OvertimeTableProps) {
  const isDirector = useAuthStore((s) => s.isDirector);
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);
  const [detail, setDetail] = useState<Overtime | null>(null);
  // null = detail modal; true/false = remark modal for approve/reject.
  const [reviewApprove, setReviewApprove] = useState<boolean | null>(null);

  // Directors review overtime that isn't their own and hasn't been acted on.
  const canReview = (o: Overtime) =>
    isDirector && o.user.uuid !== currentUserUuid && !o.director_action_at;

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-surface-container-low"
          />
        ))}
      </div>
    );
  }

  if (overtimes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No overtime requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Submitted
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Remark
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              File
            </th>
            <th className="py-3 pl-4 pr-6 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Detail
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {overtimes.map((o) => {
            const status = overtimeStatus(o);
            return (
              <tr
                key={o.uuid}
                className="transition-colors hover:bg-surface-container-low/50"
              >
                <td className="py-3 pl-6 pr-4 text-sm text-on-surface">
                  {formatDate(o.created_at)}
                </td>
                <td className="max-w-xs px-4 py-3 text-left text-sm text-on-surface-variant">
                  <span className="block truncate">{o.description || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${status.className}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <FileLink url={o.attachment_path} />
                </td>
                <td className="py-3 pl-4 pr-6">
                  <button
                    onClick={() => setDetail(o)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Detail and remark modals are mutually exclusive: choosing approve or
          reject swaps the detail modal out for the remark modal, and cancelling
          the remark modal swaps the detail modal back in. */}
      {detail && reviewApprove === null && (
        <OvertimeDetailModal
          overtime={detail}
          canReview={canReview(detail)}
          onClose={() => setDetail(null)}
          onReview={(approve) => setReviewApprove(approve)}
        />
      )}
      {detail && reviewApprove !== null && (
        <OvertimeReviewModal
          overtime={detail}
          approve={reviewApprove}
          onClose={() => setReviewApprove(null)}
          onDone={() => {
            setReviewApprove(null);
            setDetail(null);
            onReviewed?.();
          }}
        />
      )}
    </div>
  );
}
