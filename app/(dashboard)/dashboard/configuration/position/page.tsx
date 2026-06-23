"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePositions } from "@/hooks/usePositions";
import { positionApi } from "@/lib/api/position";
import { PositionTable } from "@/components/modules/configuration/position-table";
import {
  PositionFormModal,
  type PositionFormValues,
} from "@/components/modules/configuration/position-form-modal";
import { PositionDeleteModal } from "@/components/modules/configuration/position-delete-modal";
import { usePermissions } from "@/hooks/usePermissions";
import type { Position } from "@/types/position";

export default function PositionPage() {
  const { can } = usePermissions();
  const canCreate = can("position_create");
  const canEdit = can("position_update");
  const canDelete = can("position_delete");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editPosition, setEditPosition] = useState<Position | null>(null);
  const [deletePosition, setDeletePosition] = useState<Position | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const params = useMemo(
    () => ({
      page,
      per_page: 15,
      ...(search ? { name: search } : {}),
    }),
    [page, search]
  );

  const { positions, pagination, isLoading, error, refetch } =
    usePositions(params);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const openCreate = () => {
    setEditPosition(null);
    setFormOpen(true);
  };

  const openEdit = (uuid: string) => {
    const target = positions.find((p) => p.uuid === uuid) ?? null;
    setEditPosition(target);
    setFormOpen(true);
  };

  const openDelete = (uuid: string) => {
    const target = positions.find((p) => p.uuid === uuid) ?? null;
    setDeletePosition(target);
  };

  const handleSubmit = async (values: PositionFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
      };
      if (editPosition) {
        await positionApi.updatePosition(editPosition.uuid, payload);
        toast.success("Position updated successfully.");
      } else {
        await positionApi.createPosition(payload);
        toast.success("Position created successfully.");
      }
      setFormOpen(false);
      setEditPosition(null);
      refetch();
    } catch {
      toast.error(
        editPosition
          ? "Failed to update position. Please try again."
          : "Failed to create position. Please try again."
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
          Position
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search positions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
          />
        </form>

        {/* New Position */}
        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Position
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
            <PositionTable
              positions={positions}
              isLoading={isLoading}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={openEdit}
              onDelete={openDelete}
            />
            {pagination && pagination.total > 0 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Showing {pagination.count} of {pagination.total} positions
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

      {/* Create / Edit Position Modal */}
      <PositionFormModal
        open={formOpen}
        mode={editPosition ? "edit" : "create"}
        defaultValues={
          editPosition
            ? {
                name: editPosition.name,
                description: editPosition.description ?? "",
              }
            : undefined
        }
        isSaving={isSaving}
        onClose={() => {
          setFormOpen(false);
          setEditPosition(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <PositionDeleteModal
        open={deletePosition !== null}
        positionName={deletePosition?.name}
        onClose={() => setDeletePosition(null)}
        onConfirm={async () => {
          if (!deletePosition) return;
          await positionApi.deletePosition(deletePosition.uuid);
          toast.success("Position deleted successfully.");
          setDeletePosition(null);
          refetch();
        }}
      />
    </div>
  );
}
