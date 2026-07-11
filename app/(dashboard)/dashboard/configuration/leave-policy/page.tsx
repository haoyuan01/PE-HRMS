"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLeavePolicies } from "@/hooks/useLeavePolicies";
import { usePermissions } from "@/hooks/usePermissions";
import { LeavePolicyTable } from "@/components/modules/configuration/leave-policy-table";
import { LeavePolicyFormModal } from "@/components/modules/configuration/leave-policy-form-modal";
import { LeavePolicyDeleteModal } from "@/components/modules/configuration/leave-policy-delete-modal";
import type { LeavePolicy } from "@/types/leave-policy";

export default function LeavePolicyPage() {
  const { can } = usePermissions();
  const canCreate = can("leave_policy_create");
  const canEdit = can("leave_policy_update");
  const canDelete = can("leave_policy_delete");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  // Form modal: null = closed. { policy: null } opens it in create mode,
  // { policy } opens it prefilled for editing.
  const [form, setForm] = useState<{ policy: LeavePolicy | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeavePolicy | null>(null);

  const params = useMemo(
    () => ({
      page,
      size: 15,
      ...(search ? { search } : {}),
    }),
    [page, search]
  );

  const { policies, pagination, isLoading, error, refetch } =
    useLeavePolicies(params);

  // Debounced live search.
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
          Configuration
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          Leave Policy
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search leave policies..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info("Filters are coming soon.")}
            className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
          {canCreate && (
            <button
              onClick={() => setForm({ policy: null })}
              className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Policy
            </button>
          )}
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
            <LeavePolicyTable
              policies={policies}
              isLoading={isLoading}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={(policy) => setForm({ policy })}
              onDelete={setDeleteTarget}
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {pagination.count} of {pagination.total} entries
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

      {/* Create / Edit Modal */}
      {form && (
        <LeavePolicyFormModal
          policy={form.policy}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <LeavePolicyDeleteModal
          policy={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
