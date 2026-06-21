"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { hasMeaningfulChange } from "@/lib/audit-log";
import { AuditLogTable } from "@/components/modules/configuration/audit-log-table";
import { AuditLogFilterModal } from "@/components/modules/configuration/audit-log-filter-modal";
import { AuditLogDetailModal } from "@/components/modules/configuration/audit-log-detail-modal";
import type { ActivityLog } from "@/types/activity-log";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [event, setEvent] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailLog, setDetailLog] = useState<ActivityLog | null>(null);

  const params = useMemo(
    () => ({
      page,
      ...(search ? { search } : {}),
      ...(event ? { event } : {}),
    }),
    [page, search, event]
  );

  const { logs, pagination, isLoading, error, refetch } = useActivityLogs(params);

  // Hide noise-only entries (e.g. "updated" rows that only changed timestamps).
  const visibleLogs = useMemo(
    () => logs.filter(hasMeaningfulChange),
    [logs]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Configuration
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          Audit Log
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search system logs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
          />
        </form>

        {/* Filter */}
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {event && (
            <span className="ml-1 rounded-full bg-ds-primary/10 px-1.5 text-xs font-semibold text-ds-primary">
              1
            </span>
          )}
        </button>
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
            <AuditLogTable
              logs={visibleLogs}
              isLoading={isLoading}
              onView={setDetailLog}
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {visibleLogs.length} of {pagination.total} entries
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

      {/* Filter Modal */}
      <AuditLogFilterModal
        open={filterOpen}
        event={event}
        onClose={() => setFilterOpen(false)}
        onApply={(value) => {
          setEvent(value);
          setPage(1);
          setFilterOpen(false);
        }}
      />

      {/* Detail Modal */}
      <AuditLogDetailModal log={detailLog} onClose={() => setDetailLog(null)} />
    </div>
  );
}
