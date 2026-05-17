"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUsers } from "@/hooks/useUsers";
import { userApi } from "@/lib/api/user";
import { UserTable } from "@/components/modules/users/user-table";
import { UserTablePagination } from "@/components/modules/users/user-table-pagination";
import { UserFilterModal, type UserFilters } from "@/components/modules/users/user-filter-modal";
import { UserDeleteModal } from "@/components/modules/users/user-delete-modal";
import { UserReactivateModal } from "@/components/modules/users/user-reactivate-modal";

export default function UserManagementPage() {
  const router = useRouter();
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({ department: "", position: "" });
  const [deleteUserUuid, setDeleteUserUuid] = useState<string | null>(null);
  const [reactivateUserUuid, setReactivateUserUuid] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      per_page: 15,
      ...(search ? { name: search } : {}),
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.position ? { position: filters.position } : {}),
    }),
    [page, search, filters.department, filters.position]
  );

  const { users, pagination, isLoading, error, refetch } = useUsers(params);

  const filteredUsers = useMemo(
    () => users.filter((u) => u.uuid !== currentUserUuid),
    [users, currentUserUuid]
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
          Manage Settings
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          User Management
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
          />
        </form>

        <div className="flex items-center gap-3">
          {/* Filters */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* Reset Filters — only visible when filters are active */}
          {(filters.department || filters.position) && (
            <button
              onClick={() => {
                setFilters({ department: "", position: "" });
                setPage(1);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-ds-error/30 px-3 py-2 text-sm font-medium text-ds-error transition-colors hover:bg-ds-error/10"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          {/* Add User */}
          <button className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" />
            Add User
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
            <UserTable
              users={filteredUsers}
              isLoading={isLoading}
              onEdit={(uuid) => router.push(`/dashboard/users/${uuid}/edit`)}
              onDelete={(uuid) => setDeleteUserUuid(uuid)}
              onReactivate={(uuid) => setReactivateUserUuid(uuid)}
            />
            {pagination && pagination.total > 0 && (
              <UserTablePagination
                pagination={pagination}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Filter Modal */}
      <UserFilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
          setIsFilterOpen(false);
        }}
        initialFilters={filters}
      />

      {/* Delete Confirmation Modal */}
      <UserDeleteModal
        open={deleteUserUuid !== null}
        onClose={() => setDeleteUserUuid(null)}
        onConfirm={async () => {
          if (!deleteUserUuid) return;
          await userApi.deleteUser(deleteUserUuid);
          toast.success("User deleted successfully.");
          setDeleteUserUuid(null);
          refetch();
        }}
      />

      {/* Reactivate Confirmation Modal */}
      <UserReactivateModal
        open={reactivateUserUuid !== null}
        onClose={() => setReactivateUserUuid(null)}
        onConfirm={async () => {
          if (!reactivateUserUuid) return;
          await userApi.reactivateUser(reactivateUserUuid);
          toast.success("User reactivated successfully.");
          setReactivateUserUuid(null);
          refetch();
        }}
      />
    </div>
  );
}
