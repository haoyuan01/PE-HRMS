"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, FileText, Loader2, Users, X } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/stores/useAuthStore";
import { leaveRequestApi } from "@/lib/api/leaveRequest";
import { LeaveReviewModal } from "@/components/modules/requests/leave-review-modal";
import type { LeaveRequestDetail } from "@/types/leave-request";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";
const FIELD_BOX =
  "rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface";

const LIST_ROUTE = "/dashboard/requests/leave";

function formatDate(value: string | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
}

function requestStatus(r: LeaveRequestDetail) {
  const handoverRejected =
    !!r.handover_by && !!r.handover_action_at && !r.handover_approved;
  const rejected =
    handoverRejected ||
    (r.manager_action_at && !r.manager_approved) ||
    (r.director_action_at && !r.director_approved);
  if (rejected)
    return { label: "Rejected", className: "bg-ds-error/10 text-ds-error" };
  if (r.manager_approved && r.director_approved)
    return { label: "Approved", className: "bg-emerald-500/10 text-emerald-600" };
  return {
    label: "Pending Approval",
    className: "bg-amber-500/10 text-amber-600",
  };
}

function LeaveDetailContent() {
  const router = useRouter();
  const uuid = useSearchParams().get("uuid") ?? "";
  const isManager = useAuthStore((s) => s.isManager);
  const isDirector = useAuthStore((s) => s.isDirector);
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);

  const [leave, setLeave] = useState<LeaveRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // null = closed; true = approve modal; false = reject modal.
  const [reviewApprove, setReviewApprove] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    if (!uuid) return;
    try {
      setLeave(await leaveRequestApi.getLeaveRequest(uuid));
      setError(null);
    } catch {
      setError("Failed to load leave request.");
    } finally {
      setIsLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    load();
  }, [load]);

  const status = leave ? requestStatus(leave) : null;
  const hasHandover = !!(leave?.handover_by || leave?.handover_remark);

  // Directors act once the manager has (director_action_at still null); managers
  // act while manager_action_at is null. You can't review your own request.
  const notOwn = !!leave && leave.user.uuid !== currentUserUuid;
  const reviewRole: "director" | "manager" | null = !leave
    ? null
    : isDirector && notOwn && !leave.director_action_at
      ? "director"
      : isManager && notOwn && !leave.manager_action_at
        ? "manager"
        : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(LIST_ROUTE)}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
              Leave Detail
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Review the details of this leave request.
            </p>
          </div>
        </div>
        {status && (
          <span
            className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest py-20 shadow-[var(--shadow-ambient)]">
          <Loader2 className="h-5 w-5 animate-spin text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">Loading...</span>
        </div>
      ) : error || !leave ? (
        <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
          <p className="text-sm text-ds-error">
            {error ?? "Leave request not found."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main info */}
          <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Leave Type</p>
                <div className={FIELD_BOX}>
                  {leave.leave_entitlement?.leave_policy?.name ?? "—"}
                </div>
              </div>
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Date of Application</p>
                <div className={FIELD_BOX}>
                  {format(new Date(leave.created_at), "dd MMM yyyy")}
                </div>
              </div>
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Approving Manager</p>
                <div className={FIELD_BOX}>
                  {leave.manager_approver?.personal?.full_name ??
                    leave.manager_approver?.email ??
                    "—"}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-4">
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Start Date</p>
                <div className={FIELD_BOX}>{formatDate(leave.start_date)}</div>
              </div>
              <div className="space-y-2">
                <p className={FIELD_LABEL}>End Date</p>
                <div className={FIELD_BOX}>{formatDate(leave.end_date)}</div>
              </div>
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Resume Date</p>
                <div className={FIELD_BOX}>{formatDate(leave.resume_date)}</div>
              </div>
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Duration</p>
                <div className={FIELD_BOX}>
                  {Number(leave.total_days)}{" "}
                  {leave.is_half_day ? "Half Day" : "Working Day(s)"}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <p className={FIELD_LABEL}>Reason for Leave</p>
              <div className={`${FIELD_BOX} ${leave.reason ? "" : "text-on-surface-variant"}`}>
                {leave.reason || "—"}
              </div>
            </div>
          </section>

          {/* Handover Protocol */}
          {hasHandover && (
            <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-ds-primary" />
                <h2 className="font-display text-sm font-semibold text-on-surface">
                  Handover Protocol
                </h2>
              </div>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <p className={FIELD_LABEL}>Handover To</p>
                  <div className={FIELD_BOX}>
                    {leave.handover_by?.personal?.full_name ??
                      leave.handover_by?.email ??
                      "—"}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className={FIELD_LABEL}>Handover Note</p>
                  <div
                    className={`${FIELD_BOX} ${
                      leave.handover_remark ? "" : "text-on-surface-variant"
                    }`}
                  >
                    {leave.handover_remark || "—"}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Attachment */}
          {leave.attachment_url && (
            <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6">
              <h2 className="font-display text-sm font-semibold text-on-surface">
                Supporting Document
              </h2>
              <p className="text-xs text-on-surface-variant">
                Attached documentation
              </p>
              <a
                href={leave.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-3 rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3 transition-colors hover:border-ds-primary/40"
              >
                <FileText className="h-5 w-5 shrink-0 text-ds-primary" />
                <span className="truncate text-sm text-ds-primary">
                  View attachment
                </span>
              </a>
            </section>
          )}

          {/* Manager / director review actions */}
          {reviewRole && (
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewApprove(false)}
                className="flex items-center gap-2 rounded-lg border border-ds-error/30 px-4 py-2 text-sm font-medium text-ds-error transition-colors hover:bg-ds-error/10"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => setReviewApprove(true)}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Check className="h-4 w-4" />
                Approve
              </button>
            </div>
          )}
        </div>
      )}

      {/* Approve / Reject modal */}
      {leave && reviewApprove !== null && reviewRole && (
        <LeaveReviewModal
          leaveUuid={leave.uuid}
          approve={reviewApprove}
          role={reviewRole}
          onClose={() => setReviewApprove(null)}
          onDone={() => {
            setReviewApprove(null);
            load();
          }}
        />
      )}
    </div>
  );
}

export default function LeaveDetailPage() {
  // useSearchParams() must be inside a Suspense boundary.
  return (
    <Suspense>
      <LeaveDetailContent />
    </Suspense>
  );
}
