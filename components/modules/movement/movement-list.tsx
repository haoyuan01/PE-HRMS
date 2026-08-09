"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal, X, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMovements } from "@/hooks/useMovements";
import { movementApi } from "@/lib/api/movement";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import {
  MovementFilterModal,
  type MovementFilters,
} from "@/components/modules/movement/movement-filter-modal";
import { MovementFormModal } from "@/components/modules/movement/movement-form-modal";
import type { Movement, MovementUser } from "@/types/movement";

function DeleteConfirm({
  movement,
  onClose,
  onDeleted,
}: {
  movement: Movement;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const name = movement.user?.personal?.full_name ?? movement.user?.email ?? "this staff";
  const remove = async () => {
    setIsDeleting(true);
    try {
      await movementApi.deleteMovement(movement.uuid);
      toast.success("Movement deleted.");
      onDeleted();
    } catch {
      toast.error("Failed to delete movement.");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        <h2 className="font-display text-lg font-bold text-on-surface">
          Delete Movement
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Are you sure you want to delete the movement for{" "}
          <span className="font-medium text-on-surface">{name}</span>?
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={remove}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-ds-error px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;
const EMPTY_FILTERS: MovementFilters = {
  movement_type: "",
  department: "",
  position: "",
  office: "",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : format(d, "dd MMM yyyy");
}

function Avatar({ user }: { user: MovementUser | null }) {
  const [failed, setFailed] = useState(false);
  const personal = user?.personal;
  const name = personal?.full_name ?? user?.email ?? "—";
  const image = personal?.image_path;
  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    (user?.email?.[0]?.toUpperCase() ?? "?");
  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-container-high">
      {image && !failed ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="36px"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-on-surface-variant">
          {initials}
        </span>
      )}
    </div>
  );
}

export function MovementList() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MovementFilters>(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [edit, setEdit] = useState<Movement | null>(null);
  const [del, setDel] = useState<Movement | null>(null);
  const [page, setPage] = useState(1);

  // Lookups for the filter modal + chip labels.
  const [movementTypes, setMovementTypes] = useState<LookupItem[]>([]);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [positions, setPositions] = useState<LookupItem[]>([]);
  const [offices, setOffices] = useState<LookupItem[]>([]);
  useEffect(() => {
    lookupApi.getMovementTypes().then(setMovementTypes).catch(() => {});
    lookupApi.getDepartments().then(setDepartments).catch(() => {});
    lookupApi.getPositions().then(setPositions).catch(() => {});
    lookupApi.getOffices().then(setOffices).catch(() => {});
  }, []);

  // Debounce the search so it applies live without a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      ...(search ? { user_name: search } : {}),
      ...(filters.movement_type
        ? { movement_type_uuid: filters.movement_type }
        : {}),
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.position ? { position: filters.position } : {}),
      ...(filters.office ? { office: filters.office } : {}),
    }),
    [page, search, filters]
  );

  const { movements, pagination, isLoading, error, refetch } =
    useMovements(params);

  const nameOf = (list: LookupItem[], uuid: string) =>
    list.find((i) => i.uuid === uuid)?.name;

  const isFiltered =
    !!filters.movement_type ||
    !!filters.department ||
    !!filters.position ||
    !!filters.office;

  const activeChips = [
    nameOf(movementTypes, filters.movement_type),
    nameOf(departments, filters.department),
    nameOf(positions, filters.position),
    nameOf(offices, filters.office),
  ].filter((c): c is string => !!c);

  const currentPage = pagination?.current_page ?? page;
  const lastPage = pagination?.last_page ?? 1;

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search staff name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {activeChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant"
            >
              {chip}
            </span>
          ))}
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setPage(1);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-ds-error/30 px-3 py-2 text-sm font-medium text-ds-error transition-colors hover:bg-ds-error/10"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Movement
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
        ) : isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-surface-container-low"
              />
            ))}
          </div>
        ) : movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <p className="text-sm">No staff movements found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Movement Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    End Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Location
                  </th>
                  <th className="py-3 pl-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {movements.map((m: Movement) => (
                  <tr
                    key={m.uuid}
                    className="transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="py-3 pl-6 pr-4 text-sm">
                      <div className="flex items-center gap-3">
                        <Avatar user={m.user} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-on-surface">
                            {m.user?.personal?.full_name ?? m.user?.email ?? "—"}
                          </p>
                          <p className="truncate text-xs text-on-surface-variant">
                            {m.user?.employment?.department?.name ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {m.movement_type?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatDate(m.start_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatDate(m.end_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {m.location || "—"}
                    </td>
                    <td className="py-3 pl-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEdit(m)}
                          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDel(m)}
                          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!error && !isLoading && pagination && pagination.total > 0 && (
          <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-on-surface-variant">
              Showing {movements.length} of {pagination.total} movements
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 text-sm text-on-surface-variant">
                Page {currentPage} of {lastPage}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={currentPage >= lastPage}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <MovementFilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={filters}
        movementTypes={movementTypes}
        departments={departments}
        positions={positions}
        offices={offices}
        onApply={(next) => {
          setFilters(next);
          setPage(1);
          setIsFilterOpen(false);
        }}
      />

      {isAddOpen && (
        <MovementFormModal
          onClose={() => setIsAddOpen(false)}
          onSaved={() => {
            setIsAddOpen(false);
            setPage(1);
            refetch();
          }}
        />
      )}

      {edit && (
        <MovementFormModal
          movement={edit}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            refetch();
          }}
        />
      )}

      {del && (
        <DeleteConfirm
          movement={del}
          onClose={() => setDel(null)}
          onDeleted={() => {
            setDel(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
