"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useClaimHeaders } from "@/hooks/useClaimHeaders";
import { ClaimTable } from "@/components/modules/requests/claim-table";

type Tab = "my" | "staff";

export default function ExpensesClaimFormPage() {
  const router = useRouter();
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);
  // Managers, accountants and directors (general managers) get the Staff List;
  // regular employees only see their own claims (My List).
  const isDirector = useAuthStore((s) => s.isDirector);
  const canViewStaff = useAuthStore(
    (s) => s.isManager || s.isAccountant || s.isDirector
  );
  const [tab, setTab] = useState<Tab>("my");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Force My List when the user can't view the Staff List.
  const effectiveTab: Tab = canViewStaff ? tab : "my";

  // My List filters to the current user's own claims. Staff List shows the
  // claims that name the current user as the manager approver — except for
  // directors (general managers), who see every claim (no approver filter).
  const params = useMemo(() => {
    if (effectiveTab === "my") {
      return {
        page,
        ...(currentUserUuid ? { user_uuid: currentUserUuid } : {}),
        ...(search ? { name: search } : {}),
      };
    }
    return {
      page,
      // Directors get the director-scoped list (handled server-side via the
      // is_director flag); other approvers filter to claims they approve.
      ...(isDirector
        ? { is_director: true }
        : currentUserUuid
        ? { manager_approver_uuid: currentUserUuid }
        : {}),
      ...(search ? { name: search } : {}),
    };
  }, [effectiveTab, page, currentUserUuid, isDirector, search]);

  const { claims, pagination, isLoading, error, refetch } = useClaimHeaders(params);

  // Staff List shows other people's claims — the current user's own claims
  // live under My List, so exclude them here. Director scoping is now handled
  // server-side via the is_director query flag.
  const visibleClaims = useMemo(
    () =>
      effectiveTab === "staff"
        ? claims.filter((c) => c.user?.uuid !== currentUserUuid)
        : claims,
    [claims, effectiveTab, currentUserUuid]
  );

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

      {/* Tabs — Staff List only for managers/accountants */}
      {canViewStaff && (
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
      )}

      {/* Search + Add New Request */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Add New Request */}
        <button
          onClick={() => router.push("/dashboard/requests/expenses/add")}
          className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create New Claim
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {/* Export */}
        <div className="flex justify-end pl-4 pr-6 pt-4 pb-3">
          <button
            onClick={() => toast.info("Exporting data is coming soon.")}
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>

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
              claims={visibleClaims}
              isLoading={isLoading}
              onView={(uuid) =>
                router.push(`/dashboard/requests/expenses/${uuid}`)
              }
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {visibleClaims.length} of {pagination.total} results
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
