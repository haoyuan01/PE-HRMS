"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useClaimHeaders } from "@/hooks/useClaimHeaders";
import { claimApi } from "@/lib/api/claim";
import { ClaimTable } from "@/components/modules/requests/claim-table";
import { ExportModal } from "@/components/modules/requests/export-modal";
import { TablePagination } from "@/components/common/table-pagination";
import { CLAIM_STATUS_OPTIONS } from "@/lib/claim-status";
// The Leave filter modal is reused with Month/Year hidden and the claim
// status values.
import {
  LeaveFilterModal,
  DEFAULT_LEAVE_FILTERS,
  toStatus,
  type LeaveFilters,
} from "@/components/modules/requests/leave-filter-modal";

type Tab = "my" | "staff";

export default function ExpensesClaimFormPage() {
  const router = useRouter();
  // Managers, accountants and directors (general managers) get the Staff List;
  // regular employees only see their own claims (My List).
  const canViewStaff = useAuthStore(
    (s) => s.isManager || s.isAccountant || s.isDirector
  );
  const [tab, setTab] = useState<Tab>("my");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filters, setFilters] = useState<LeaveFilters>(DEFAULT_LEAVE_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Open the tab requested via the URL (e.g. ?tab=staff from the dashboard).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "staff" || t === "my") setTab(t);
  }, []);

  // Force My List when the user can't view the Staff List.
  const effectiveTab: Tab = canViewStaff ? tab : "my";

  // The Status filter applies to both tabs and is kept when switching.
  const status = toStatus(filters);
  const statusChip = status
    ? CLAIM_STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ?? status
    : null;

  // A new filter is a new result set, so go back to its first page.
  const applyFilters = (next: LeaveFilters) => {
    setFilters(next);
    setPage(1);
  };

  // The backend scopes both tabs from the token: show_all=1 is the Staff List,
  // show_all=0 is My List. Paging and search stay server-side.
  const params = useMemo(
    () => ({
      page,
      show_all: effectiveTab === "staff",
      ...(search ? { name: search } : {}),
      status,
      // Newest claims first on the Staff List.
      ...(effectiveTab === "staff"
        ? { sortBy: "created_at", orderBy: "desc" }
        : {}),
    }),
    [effectiveTab, page, search, status]
  );

  const { claims, pagination, isLoading, error, refetch } = useClaimHeaders(params);

  const switchTab = (next: Tab) => {
    setTab(next);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Debounced live search — filters as you type without pressing Enter.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Finance &amp; Administration
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          Expenses Claim
        </h1>
      </div>

      {/* Tabs (managers/accountants/directors) + Filters, like Leave */}
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
        {statusChip && (
          <>
            <span className="inline-flex items-center rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant">
              {statusChip}
            </span>
            <button
              type="button"
              onClick={() => applyFilters(DEFAULT_LEAVE_FILTERS)}
              className="flex items-center gap-1.5 rounded-lg border border-ds-error/30 px-3 py-2 text-sm font-medium text-ds-error transition-colors hover:bg-ds-error/10"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          </>
        )}
      </div>

      {/* Search on the left, actions on the right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap items-center gap-3 sm:flex-1">
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          {/* Export */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          {/* Add New Request */}
          <button
            onClick={() => router.push("/dashboard/requests/expenses/add")}
            className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create New Claim
          </button>
        </div>
      </div>

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
            <ClaimTable
              claims={claims}
              isLoading={isLoading}
              onView={(uuid) =>
                router.push(
                  `/dashboard/requests/expenses/detail?uuid=${uuid}&tab=${effectiveTab}`
                )
              }
            />
            {pagination && pagination.total > 0 && (
              <TablePagination
                shown={claims.length}
                total={pagination.total}
                label="results"
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
          showStatus
          showPeriod={false}
          statusOptions={CLAIM_STATUS_OPTIONS}
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
          title="Export Claims"
          onClose={() => setIsExportOpen(false)}
          onExport={async ({ from, to }) => {
            try {
              await claimApi.exportExcel({
                created_from: from,
                created_to: to,
                relevant_to_me: effectiveTab === "my",
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
