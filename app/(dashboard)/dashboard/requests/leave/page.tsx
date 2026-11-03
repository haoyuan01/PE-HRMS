"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { useLeaveStatusSummary } from "@/hooks/useLeaveStatusSummary";
import { leaveRequestApi } from "@/lib/api/leaveRequest";
import { LeaveStatusCards } from "@/components/modules/requests/leave-status-cards";
import { LeaveRequestTable } from "@/components/modules/requests/leave-request-table";
import { ExportModal } from "@/components/modules/requests/export-modal";
import {
  LeaveFilterModal,
  DEFAULT_LEAVE_FILTERS,
  MONTH_NAMES,
  toMonthYear,
  type LeaveFilters,
} from "@/components/modules/requests/leave-filter-modal";
import { TablePagination } from "@/components/common/table-pagination";

type Tab = "my" | "staff";

const PAGE_SIZE = 15;

export default function LeaveFormPage() {
  const router = useRouter();
  // Managers and directors (general managers) get the Staff List; everyone
  // else only sees their own requests (My List).
  const canViewStaff = useAuthStore((s) => s.isManager || s.isDirector);

  const [tab, setTab] = useState<Tab>("my");
  const [page, setPage] = useState(1);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filters, setFilters] = useState<LeaveFilters>(DEFAULT_LEAVE_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const monthYear = toMonthYear(filters);
  const filterChip = monthYear
    ? `${MONTH_NAMES[Number(filters.month) - 1]} ${filters.year}`
    : null;

  // A new filter is a new result set, so go back to its first page.
  const applyFilters = (next: LeaveFilters) => {
    setFilters(next);
    setPage(1);
  };

  // Open the tab requested via the URL (e.g. ?tab=staff from the dashboard).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "staff" || t === "my") setTab(t);
  }, []);

  const effectiveTab: Tab = canViewStaff ? tab : "my";

  // The backend scopes both tabs from the token: show_all=1 is the Staff List,
  // show_all=0 is My List. Paging is server-side (see PAGINATION.md).
  const { requests, pagination, isLoading, error, refetch } = useLeaveRequests({
    page,
    size: PAGE_SIZE,
    show_all: effectiveTab === "staff",
    month_year: monthYear,
  });

  // Status summary cards — managers/directors only. Same tab and month as
  // the table, so the totals match the rows below.
  const { summary, isLoading: summaryLoading } = useLeaveStatusSummary({
    show_all: effectiveTab === "staff",
    month_year: monthYear,
    enabled: canViewStaff,
  });

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

      {/* Tabs (managers/directors only) + Filters on the left, actions on the right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {canViewStaff && (
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
          )}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          {filterChip && (
            <span className="inline-flex items-center rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant">
              {filterChip}
            </span>
          )}
          {filterChip && (
            <button
              type="button"
              onClick={() => applyFilters(DEFAULT_LEAVE_FILTERS)}
              className="flex items-center gap-1.5 rounded-lg border border-ds-error/30 px-3 py-2 text-sm font-medium text-ds-error transition-colors hover:bg-ds-error/10"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Export covers the staff list, so it is offered on that tab only. */}
          {effectiveTab === "staff" && (
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
          <button
            onClick={() => router.push("/dashboard/requests/leave/add")}
            className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create New Leave
          </button>
        </div>
      </div>

      {/* Status summary cards — managers/directors only */}
      {canViewStaff && (
        <LeaveStatusCards summary={summary} isLoading={summaryLoading} />
      )}

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
              requests={requests}
              isLoading={isLoading}
              showStaff={effectiveTab === "staff"}
              onView={(r) =>
                router.push(`/dashboard/requests/leave/detail?uuid=${r.uuid}`)
              }
            />
            {pagination && pagination.total > 0 && (
              <TablePagination
                shown={requests.length}
                total={pagination.total}
                label="requests"
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {isFilterOpen && (
        <LeaveFilterModal
          onClose={() => setIsFilterOpen(false)}
          initialFilters={filters}
          onApply={(next) => {
            applyFilters(next);
            setIsFilterOpen(false);
          }}
        />
      )}

      {isExportOpen && (
        <ExportModal
          title="Export Leave Requests"
          onClose={() => setIsExportOpen(false)}
          onExport={async ({ from, to }) => {
            try {
              await leaveRequestApi.exportExcel({
                created_from: from,
                created_to: to,
              });
              toast.success("Export downloaded.");
            } catch {
              toast.error("Failed to export. Please try again.");
              throw new Error("export failed");
            }
          }}
        />
      )}
    </div>
  );
}
