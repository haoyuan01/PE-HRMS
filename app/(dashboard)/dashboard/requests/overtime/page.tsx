"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useOvertimes } from "@/hooks/useOvertimes";
import { OvertimeTable } from "@/components/modules/requests/overtime-table";

export default function OvertimeListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { overtimes, pagination, isLoading, error, refetch } = useOvertimes({
    page,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Management &middot; Requests
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          Overtime Requests
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push("/dashboard/requests/overtime/add")}
          className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add New Overtime
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
            <OvertimeTable
              overtimes={overtimes}
              isLoading={isLoading}
              onReviewed={refetch}
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {overtimes.length} of {pagination.total} requests
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
