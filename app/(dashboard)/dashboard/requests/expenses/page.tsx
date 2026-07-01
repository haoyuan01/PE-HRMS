"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useClaimHeaders } from "@/hooks/useClaimHeaders";
import { ClaimTable } from "@/components/modules/requests/claim-table";

type Tab = "my" | "staff";

export default function ExpensesClaimFormPage() {
  const router = useRouter();
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);
  // Managers and accountants can view everyone's claims (Staff List); regular
  // employees only see their own (My List).
  const canViewStaff = useAuthStore((s) => s.isManager || s.isAccountant);
  const [tab, setTab] = useState<Tab>("my");
  const [page, setPage] = useState(1);

  // Force My List when the user can't view the Staff List.
  const effectiveTab: Tab = canViewStaff ? tab : "my";

  // My List filters to the current user's claims; Staff List shows everyone's.
  const params = useMemo(
    () => ({
      page,
      ...(effectiveTab === "my" && currentUserUuid
        ? { user_uuid: currentUserUuid }
        : {}),
    }),
    [effectiveTab, page, currentUserUuid]
  );

  const { claims, pagination, isLoading, error, refetch } = useClaimHeaders(params);

  const switchTab = (next: Tab) => {
    setTab(next);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            Finance &amp; Administration
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
            Expenses Claim
          </h1>
        </div>

        {/* Add New Request */}
        <button
          onClick={() => router.push("/dashboard/requests/expenses/add")}
          className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add New Request
        </button>
      </div>

      {/* Toolbar: tabs (left) + export (right) */}
      <div className="flex items-center justify-between gap-3 pr-2">
        {/* Tabs — Staff List only for managers/accountants */}
        {canViewStaff ? (
          <div className="flex items-center gap-1 rounded-lg bg-surface-container-low p-1 w-fit">
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

        {/* Export */}
        <button
          onClick={() => toast.info("Exporting data is coming soon.")}
          className="flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <Download className="h-4 w-4" />
          Export Data
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
            <ClaimTable
              claims={claims}
              isLoading={isLoading}
              onView={(uuid) =>
                router.push(`/dashboard/requests/expenses/${uuid}`)
              }
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {pagination.count} of {pagination.total} results
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
