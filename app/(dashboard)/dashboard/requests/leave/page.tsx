"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { leaveRequestApi } from "@/lib/api/leaveRequest";
import { LeaveStatusCards } from "@/components/modules/requests/leave-status-cards";
import { LeaveRequestTable } from "@/components/modules/requests/leave-request-table";
import type { LeaveStatusSummary } from "@/types/leave-request";

type Tab = "my" | "staff";

export default function LeaveFormPage() {
  const router = useRouter();
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);
  const isDirector = useAuthStore((s) => s.isDirector);
  // Managers and directors (general managers) get the Staff List; everyone
  // else only sees their own requests (My List).
  const canViewStaff = useAuthStore((s) => s.isManager || s.isDirector);

  const [tab, setTab] = useState<Tab>("my");
  const [page, setPage] = useState(1);
  const effectiveTab: Tab = canViewStaff ? tab : "my";

  // My List filters to the current user's own requests. Staff List shows the
  // requests the current user approves — managers by manager_approver_uuid,
  // directors via the is_director flag (server-scoped).
  const params = useMemo(() => {
    if (effectiveTab === "my") {
      return {
        page,
        ...(currentUserUuid ? { user_uuid: currentUserUuid } : {}),
      };
    }
    return {
      page,
      ...(isDirector
        ? { is_director: true }
        : currentUserUuid
        ? { manager_approver_uuid: currentUserUuid }
        : {}),
    };
  }, [effectiveTab, page, currentUserUuid, isDirector]);

  const { requests, pagination, isLoading, error, refetch } =
    useLeaveRequests(params);

  // Staff List shows other people's requests — the current user's own live
  // under My List, so exclude them here.
  const visibleRequests = useMemo(
    () =>
      effectiveTab === "staff"
        ? requests.filter((r) => r.user?.uuid !== currentUserUuid)
        : requests,
    [requests, effectiveTab, currentUserUuid]
  );

  // Status summary cards (global totals).
  const [summary, setSummary] = useState<LeaveStatusSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  useEffect(() => {
    leaveRequestApi
      .getStatusSummaries()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, []);

  const switchTab = (next: Tab) => {
    setTab(next);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Management &middot; Requests
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          Leave Requests
        </h1>
      </div>

      {/* Tabs (managers/directors only) + Create button, on one row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {canViewStaff ? (
          <div className="flex w-fit items-center gap-1 rounded-lg bg-surface-container-low p-1">
            {(["my", "staff"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t === "my" ? "My List" : "Staff List"}
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}
        <button
          onClick={() => router.push("/dashboard/requests/leave/add")}
          className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create New Leave
        </button>
      </div>

      {/* Status summary cards */}
      <LeaveStatusCards summary={summary} isLoading={summaryLoading} />

      {/* Table Card */}
      <div className="rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {error ? (
          <div className="p-8">
            <p className="text-sm text-ds-error">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <LeaveRequestTable
              requests={visibleRequests}
              isLoading={isLoading}
              showStaff={effectiveTab === "staff"}
              onView={() =>
                toast.info("Leave request detail is coming soon.")
              }
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {visibleRequests.length} of {pagination.total} requests
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.current_page <= 1}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={pagination.current_page >= pagination.last_page}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
