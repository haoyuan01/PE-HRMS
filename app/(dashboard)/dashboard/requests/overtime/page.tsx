"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useOvertimes } from "@/hooks/useOvertimes";
import { OvertimeTable } from "@/components/modules/requests/overtime-table";
import { TablePagination } from "@/components/common/table-pagination";

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
              <TablePagination
                shown={overtimes.length}
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
    </div>
  );
}
