"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info, ReceiptText, FileText, Loader2, Check, X } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { claimApi } from "@/lib/api/claim";
import type { ClaimHeader, ClaimItem } from "@/types/claim";
import {
  claimItemStatus,
  claimStatus,
  isManagerRejected,
  type StatusBadge,
} from "@/lib/claim-status";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";
const FIELD_BOX =
  "rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface";

const LIST_ROUTE = "/dashboard/requests/expenses";

function formatAmount(amount: string) {
  const value = Number(amount);
  if (Number.isNaN(value)) return `RM ${amount}`;
  return `RM ${value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return format(new Date(value), "dd/MM/yyyy");
}

function fileName(path: string) {
  return path.split("/").pop() ?? path;
}

// One reviewer's decision on an item: "Approved by {name} ({role})".
function DecisionBanner({
  approved,
  name,
  role,
  at,
}: {
  approved: boolean;
  name: string;
  role: string;
  /** When they acted; omitted from the text if missing. */
  at: string | null;
}) {
  const date = at ? new Date(at) : null;
  const when =
    date && !Number.isNaN(date.getTime()) ? format(date, "dd MMM yyyy") : null;
  return (
    <div
      className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
        approved
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-ds-error/10 text-ds-error"
      }`}
    >
      {approved ? (
        <Check className="h-4 w-4 shrink-0" />
      ) : (
        <X className="h-4 w-4 shrink-0" />
      )}
      <span>
        {approved ? "Approved" : "Rejected"} by {name}{" "}
        <span className="font-normal opacity-80">({role})</span>
        {when && <> on {when}</>}
      </span>
    </div>
  );
}

function personName(p: ClaimItem["manager_action_by"], fallback: string) {
  return p?.personal?.full_name ?? p?.email ?? fallback;
}

// Manager then General Manager decision bars — only for a stage that has
// actually approved or rejected the item. Anything else (pending, null, an
// unexpected value) shows no bar.
function stageDecision(
  definition: string | null | undefined,
  approvedValue: string,
  rejectedValue: string,
  actionAt: string | null,
  approvedFlag: boolean
): boolean | null {
  if (definition === approvedValue) return true;
  if (definition === rejectedValue) return false;
  // Only fall back to the old fields when the API sent no definition at all.
  if (definition === undefined && actionAt) return approvedFlag;
  return null;
}

function ItemDecisions({ item }: { item: ClaimItem }) {
  const manager = stageDecision(
    item.manager_approve_definition,
    "manager_approved",
    "manager_rejected",
    item.manager_action_at,
    item.manager_approved
  );
  const director = stageDecision(
    item.director_approve_definition,
    "director_approved",
    "director_rejected",
    item.director_action_at,
    item.director_approved
  );
  const managerActed = manager !== null;
  const directorActed = director !== null;
  const managerApproved = manager === true;
  const directorApproved = director === true;

  return (
    <>
      {managerActed && (
        <DecisionBanner
          approved={managerApproved}
          name={personName(item.manager_action_by, "Manager")}
          role="Manager"
          at={item.manager_action_at}
        />
      )}
      {directorActed && (
        <DecisionBanner
          approved={directorApproved}
          name={personName(item.director_action_by, "General Manager")}
          role="General Manager"
          at={item.director_action_at}
        />
      )}
    </>
  );
}

// Per-item outcome badge, shared by the manager and director review flows.
function ReviewOutcome({ status }: { status: StatusBadge }) {
  return (
    <div className="mt-4 flex justify-end">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${status.className}`}
      >
        {status.label}
      </span>
    </div>
  );
}

// Approve/Reject buttons, shared by the manager and director review flows.
function ReviewActions({
  onReject,
  onApprove,
  disabled,
  showApprove = true,
}: {
  onReject: () => void;
  onApprove: () => void;
  disabled: boolean;
  showApprove?: boolean;
}) {
  return (
    <div className="mt-4 flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onReject}
        disabled={disabled}
        className="flex items-center gap-2 rounded-lg border border-ds-error/30 px-4 py-2 text-sm font-medium text-ds-error transition-colors hover:bg-ds-error/10 disabled:opacity-50"
      >
        <X className="h-4 w-4" />
        Reject
      </button>
      {showApprove && (
        <button
          type="button"
          onClick={onApprove}
          disabled={disabled}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          Approve
        </button>
      )}
    </div>
  );
}

function ClaimDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid") ?? "";
  // Opened from the Staff List (?tab=staff): show who applied. From My List
  // the applicant is the viewer, so the name is hidden.
  const fromStaffList = searchParams.get("tab") === "staff";
  const listRoute = fromStaffList ? `${LIST_ROUTE}?tab=staff` : LIST_ROUTE;
  const isManager = useAuthStore((s) => s.isManager);
  const isDirector = useAuthStore((s) => s.isDirector);
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);

  const [claim, setClaim] = useState<ClaimHeader | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingItem, setProcessingItem] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  const loadClaim = useCallback(async () => {
    try {
      setClaim(await claimApi.getClaimHeader(uuid));
      setError(null);
    } catch {
      setError("Failed to load claim.");
    } finally {
      setIsLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  // Shared approve/reject handler — the manager and director flows differ only
  // by which API call is passed in.
  const reviewItem = async (
    itemUuid: string,
    approve: boolean,
    apiCall: (uuid: string) => Promise<void>
  ) => {
    setProcessingItem(itemUuid);
    try {
      await apiCall(itemUuid);
      toast.success(approve ? "Expense item approved." : "Expense item rejected.");
      await loadClaim();
    } catch {
      toast.error(
        `Failed to ${approve ? "approve" : "reject"} item. Please try again.`
      );
    } finally {
      setProcessingItem(null);
    }
  };

  // Header-level "Reviewed" action — the manager and director flows differ only
  // by which API call is passed in.
  const submitReview = async (apiCall: (uuid: string) => Promise<void>) => {
    if (!claim) return;
    setIsReleasing(true);
    try {
      await apiCall(claim.uuid);
      toast.success("Claim reviewed successfully.");
      await loadClaim();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Failed to submit review. Please try again.";
      toast.error(message);
    } finally {
      setIsReleasing(false);
    }
  };

  // A manager who has already reviewed this claim no longer sees the Reviewed
  // button; the status then reflects whether the General Manager (director) has
  // also signed off.
  const managerReviewed = !!claim?.manager_reviewed_by;
  const directorReviewed = !!claim?.director_reviewed_by;
  const status = claim
    ? claimStatus(claim)
    : null;
  // You can't review your own claim (e.g. opened from My List) — hide all
  // review actions in that case.
  const isOwnClaim = claim?.user?.uuid === currentUserUuid;
  const canApprove = isManager && !isOwnClaim;
  // Directors (General Managers) review items with their own approve/reject.
  // A manager rejection is final — the claim never reaches the director.
  const canDirectorReview =
    isDirector && !isOwnClaim && !(claim && isManagerRejected(claim));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(listRoute)}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
              Expenses Claim Detail
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Review details of the submitted claim.
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
      ) : error || !claim ? (
        <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
          <p className="text-sm text-ds-error">{error ?? "Claim not found."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-ds-primary" />
              <h2 className="font-display text-sm font-semibold text-on-surface">
                Basic Information
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              {fromStaffList && (
                <div className="space-y-2 md:col-span-2">
                  <p className={FIELD_LABEL}>Applicant Name</p>
                  <div className={FIELD_BOX}>
                    {claim.user?.personal?.full_name ?? claim.user?.email ?? "—"}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Manager for Approval</p>
                <div className={FIELD_BOX}>
                  {claim.manager_approver?.personal?.full_name ??
                    claim.manager_approver?.email ??
                    "—"}
                </div>
              </div>
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Travel Location</p>
                <div className={FIELD_BOX}>{claim.name}</div>
              </div>
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Travel Period Start Date</p>
                <div className={FIELD_BOX}>{formatDate(claim.start_date)}</div>
              </div>
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Travel Period End Date</p>
                <div className={FIELD_BOX}>{formatDate(claim.end_date)}</div>
              </div>
            </div>
          </section>

          {/* Expenses Items */}
          <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-ds-primary" />
              <h2 className="font-display text-sm font-semibold text-on-surface">
                Expenses Item
              </h2>
            </div>

            <div className="mt-5 space-y-5">
              {claim.claim_items.map((item) => (
                <div
                  key={item.uuid}
                  className="rounded-xl border border-outline-variant/20 p-4 sm:p-5"
                >
                  {/* Description */}
                  <div className="space-y-2">
                    <p className={FIELD_LABEL}>Description</p>
                    <div className={FIELD_BOX}>{item.name}</div>
                  </div>

                  {/* Amount + Date */}
                  <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className={FIELD_LABEL}>Amount</p>
                      <div className={FIELD_BOX}>{formatAmount(item.amount)}</div>
                    </div>
                    <div className="space-y-2">
                      <p className={FIELD_LABEL}>Date</p>
                      <div className={FIELD_BOX}>{formatDate(item.date)}</div>
                    </div>
                  </div>

                  {/* Receipt */}
                  <div className="mt-4 space-y-2">
                    <p className={FIELD_LABEL}>Receipt Upload</p>
                    {item.attachment_path ? (
                      <a
                        href={item.attachment_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3 transition-colors hover:border-ds-primary/40"
                      >
                        <FileText className="h-5 w-5 shrink-0 text-ds-primary" />
                        <span className="truncate text-sm text-ds-primary">
                          {fileName(item.attachment_path)}
                        </span>
                      </a>
                    ) : (
                      <div className={`${FIELD_BOX} text-on-surface-variant`}>—</div>
                    )}
                  </div>

                  {/* Who approved/rejected this item, shown to everyone:
                      the manager's bar, then the General Manager's. */}
                  <ItemDecisions item={item} />

                  {/* Review actions for whoever still has to act. Directors
                      use the director_* endpoints, managers the manager_*
                      ones. Nobody acted yet and nothing to do → Pending. */}
                  {isDirector && canDirectorReview && !item.director_action_at ? (
                    <ReviewActions
                      disabled={processingItem === item.uuid}
                      onReject={() =>
                        reviewItem(item.uuid, false, claimApi.directorRejectClaimItem)
                      }
                      onApprove={() =>
                        reviewItem(item.uuid, true, claimApi.directorApproveClaimItem)
                      }
                    />
                  ) : !isDirector && canApprove && !item.manager_action_at ? (
                    <ReviewActions
                      disabled={processingItem === item.uuid}
                      onReject={() =>
                        reviewItem(item.uuid, false, claimApi.rejectClaimItem)
                      }
                      onApprove={() =>
                        reviewItem(item.uuid, true, claimApi.approveClaimItem)
                      }
                    />
                  ) : (
                    claimItemStatus(item).label === "Pending" && (
                      <ReviewOutcome status={claimItemStatus(item)} />
                    )
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Footer action — header-level review, hidden once that role has
              reviewed. Directors use their own endpoint; everyone else the
              manager one. */}
          {(isDirector
            ? canDirectorReview && !directorReviewed
            : canApprove && !managerReviewed) && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  submitReview(
                    isDirector
                      ? claimApi.directorReviewClaim
                      : claimApi.managerReviewClaim
                  )
                }
                disabled={isReleasing}
                className="flex items-center gap-2 rounded-[0.75rem] bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isReleasing ? (
                  "Submitting..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirm Reviewed
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClaimDetailPage() {
  // useSearchParams() must be inside a Suspense boundary.
  return (
    <Suspense>
      <ClaimDetailContent />
    </Suspense>
  );
}
