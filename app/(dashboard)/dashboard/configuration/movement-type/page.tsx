"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { useMovementTypes } from "@/hooks/useMovementTypes";
import { movementTypeApi } from "@/lib/api/movementType";
import { MovementTypeTable } from "@/components/modules/configuration/movement-type-table";
import {
  MovementTypeFormModal,
  type MovementTypeFormValues,
} from "@/components/modules/configuration/movement-type-form-modal";
import { MovementTypeDeleteModal } from "@/components/modules/configuration/movement-type-delete-modal";
import type { MovementType } from "@/types/movement-type";

export default function MovementTypePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editMovementType, setEditMovementType] = useState<MovementType | null>(
    null
  );
  const [deleteMovementType, setDeleteMovementType] =
    useState<MovementType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const params = useMemo(
    () => ({
      page,
      size: 15,
      ...(search ? { search } : {}),
    }),
    [page, search]
  );

  const { movementTypes, pagination, isLoading, error, refetch } =
    useMovementTypes(params);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const openCreate = () => {
    setEditMovementType(null);
    setFormOpen(true);
  };

  const openEdit = (uuid: string) => {
    setEditMovementType(movementTypes.find((m) => m.uuid === uuid) ?? null);
    setFormOpen(true);
  };

  const openDelete = (uuid: string) => {
    setDeleteMovementType(movementTypes.find((m) => m.uuid === uuid) ?? null);
  };

  const handleSubmit = async (values: MovementTypeFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || null,
      };
      if (editMovementType) {
        await movementTypeApi.updateMovementType(editMovementType.uuid, payload);
        toast.success("Movement type updated successfully.");
      } else {
        await movementTypeApi.createMovementType(payload);
        toast.success("Movement type created successfully.");
      }
      setFormOpen(false);
      setEditMovementType(null);
      refetch();
    } catch {
      toast.error(
        editMovementType
          ? "Failed to update movement type. Please try again."
          : "Failed to create movement type. Please try again."
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
          Movement Type
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search movement types..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
          />
        </form>

        {/* New Movement Type */}
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Movement Type
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
            <MovementTypeTable
              movementTypes={movementTypes}
              isLoading={isLoading}
              canEdit
              canDelete
              onEdit={openEdit}
              onDelete={openDelete}
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {pagination.count} of {pagination.total} movement types
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

      {/* Create / Edit Movement Type Modal */}
      <MovementTypeFormModal
        open={formOpen}
        mode={editMovementType ? "edit" : "create"}
        defaultValues={
          editMovementType
            ? {
                name: editMovementType.name,
                description: editMovementType.description ?? "",
              }
            : undefined
        }
        isSaving={isSaving}
        onClose={() => {
          setFormOpen(false);
          setEditMovementType(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <MovementTypeDeleteModal
        open={deleteMovementType !== null}
        movementTypeName={deleteMovementType?.name}
        onClose={() => setDeleteMovementType(null)}
        onConfirm={async () => {
          if (!deleteMovementType) return;
          await movementTypeApi.deleteMovementType(deleteMovementType.uuid);
          toast.success("Movement type deleted successfully.");
          setDeleteMovementType(null);
          refetch();
        }}
      />
    </div>
  );
}
