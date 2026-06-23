"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { useOffices } from "@/hooks/useOffices";
import { officeApi } from "@/lib/api/office";
import { BranchTable } from "@/components/modules/configuration/branch-table";
import {
  BranchFormModal,
  EMPTY_BRANCH,
  type BranchFormValues,
} from "@/components/modules/configuration/branch-form-modal";
import { BranchDeleteModal } from "@/components/modules/configuration/branch-delete-modal";
import { usePermissions } from "@/hooks/usePermissions";
import type { Office } from "@/types/office";

export default function BranchOfficePage() {
  const { can } = usePermissions();
  const canCreate = can("office_create");
  const canEdit = can("office_update");
  const canDelete = can("office_delete");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editUuid, setEditUuid] = useState<string | null>(null);
  const [editDefaults, setEditDefaults] = useState<BranchFormValues | undefined>(
    undefined
  );
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [deleteOffice, setDeleteOffice] = useState<Office | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const params = useMemo(
    () => ({
      page,
      size: 15,
      ...(search ? { search } : {}),
    }),
    [page, search]
  );

  const { offices, pagination, isLoading, error, refetch } = useOffices(params);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const openCreate = () => {
    setEditUuid(null);
    setEditDefaults(undefined);
    setFormOpen(true);
  };

  const openEdit = async (uuid: string) => {
    setEditUuid(uuid);
    setEditDefaults(undefined);
    setFormOpen(true);
    setIsLoadingEdit(true);
    try {
      const office = await officeApi.getOffice(uuid);
      setEditDefaults({
        name: office.name ?? "",
        phone_number: office.phone_number ?? "",
        fax_number: office.fax_number ?? "",
        email: office.email ?? "",
        address_1: office.address_1 ?? "",
        address_2: office.address_2 ?? "",
        address_3: office.address_3 ?? "",
        city: office.city ?? "",
        state: office.state ?? "",
        postcode: office.postcode ?? "",
        country: office.country ?? "",
        description: office.description ?? "",
      });
    } catch {
      toast.error("Failed to load branch details. Please try again.");
      setFormOpen(false);
      setEditUuid(null);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const openDelete = (uuid: string) => {
    setDeleteOffice(offices.find((o) => o.uuid === uuid) ?? null);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditUuid(null);
    setEditDefaults(undefined);
  };

  const handleSubmit = async (values: BranchFormValues) => {
    setIsSaving(true);
    try {
      // Send only the fields that have a value so empty optionals are omitted.
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== "")
      ) as BranchFormValues;
      payload.name = values.name;

      if (editUuid) {
        await officeApi.updateOffice(editUuid, payload);
        toast.success("Branch updated successfully.");
      } else {
        await officeApi.createOffice(payload);
        toast.success("Branch created successfully.");
      }
      closeForm();
      refetch();
    } catch {
      toast.error(
        editUuid
          ? "Failed to update branch. Please try again."
          : "Failed to create branch. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Configuration
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          Branch Office
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search branch name, city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
          />
        </form>

        {/* New Branch */}
        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Branch
          </button>
        )}
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
            <BranchTable
              offices={offices}
              isLoading={isLoading}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={openEdit}
              onDelete={openDelete}
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {pagination.count} of {pagination.total} branches
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

      {/* Create / Edit Branch Modal */}
      <BranchFormModal
        open={formOpen}
        mode={editUuid ? "edit" : "create"}
        defaultValues={editUuid ? editDefaults : EMPTY_BRANCH}
        isLoadingData={isLoadingEdit}
        isSaving={isSaving}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <BranchDeleteModal
        open={deleteOffice !== null}
        branchName={deleteOffice?.name}
        onClose={() => setDeleteOffice(null)}
        onConfirm={async () => {
          if (!deleteOffice) return;
          await officeApi.deleteOffice(deleteOffice.uuid);
          toast.success("Branch deleted successfully.");
          setDeleteOffice(null);
          refetch();
        }}
      />
    </div>
  );
}
