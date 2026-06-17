"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRoles } from "@/hooks/useRoles";
import { RoleTable } from "@/components/modules/configuration/role-table";

export default function PermissionPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const params = useMemo(
    () => ({
      page,
      per_page: 15,
      ...(search ? { name: search } : {}),
    }),
    [page, search]
  );

  const { roles, pagination, isLoading, error, refetch } = useRoles(params);

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
          Permissions
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
          />
        </form>

        {/* New Permission */}
        <button
          onClick={() => toast.info("Creating permissions is coming soon.")}
          className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Permission
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
            <RoleTable
              roles={roles}
              isLoading={isLoading}
              onEdit={() => toast.info("Editing permissions is coming soon.")}
              onDelete={() => toast.info("Deleting permissions is coming soon.")}
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {pagination.count} of {pagination.total} permissions
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
