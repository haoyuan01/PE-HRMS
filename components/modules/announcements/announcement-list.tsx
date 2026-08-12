"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { usePermissions } from "@/hooks/usePermissions";
import { announcementApi } from "@/lib/api/announcement";
import {
  AnnouncementFilterModal,
  type AnnouncementFilters,
} from "@/components/modules/announcements/announcement-filter-modal";
import { AnnouncementFormModal } from "@/components/modules/announcements/announcement-form-modal";
import type { Announcement } from "@/types/announcement";

function DeleteConfirm({
  announcement,
  onClose,
  onDeleted,
}: {
  announcement: Announcement;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const remove = async () => {
    setIsDeleting(true);
    try {
      await announcementApi.deleteAnnouncement(announcement.uuid);
      toast.success("Announcement deleted.");
      onDeleted();
    } catch {
      toast.error("Failed to delete announcement.");
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
          Delete Announcement
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Are you sure you want to delete{" "}
          <span className="font-medium text-on-surface">
            {announcement.name}
          </span>
          ?
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

const PAGE_SIZE = 15;
const EMPTY_FILTERS: AnnouncementFilters = { published: "all" };

function formatRange(start: string | null, end: string | null) {
  if (!start) return "—";
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return start;
  const e = end ? new Date(end) : null;
  if (!e || Number.isNaN(e.getTime()) || start === end) {
    return format(s, "dd MMM yyyy");
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  return `${format(s, sameYear ? "dd MMM" : "dd MMM yyyy")} – ${format(e, "dd MMM yyyy")}`;
}

export function AnnouncementList() {
  const { can } = usePermissions();
  const canCreate = can("announcement_create");
  const canUpdate = can("announcement_update");
  const canDelete = can("announcement_delete");
  const showActions = canUpdate || canDelete;
  const [del, setDel] = useState<Announcement | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [edit, setEdit] = useState<Announcement | null>(null);
  const [editLoadingUuid, setEditLoadingUuid] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  // Fetch the fresh single record before opening the edit form.
  const openEdit = async (uuid: string) => {
    setEditLoadingUuid(uuid);
    try {
      setEdit(await announcementApi.getAnnouncement(uuid));
    } catch {
      toast.error("Failed to load announcement.");
    } finally {
      setEditLoadingUuid(null);
    }
  };
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AnnouncementFilters>(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Debounce search so it applies live without a request per keystroke.
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
      ...(search ? { name: search } : {}),
      ...(filters.published !== "all"
        ? { is_published: filters.published === "published" }
        : {}),
    }),
    [page, search, filters]
  );

  const { announcements, pagination, isLoading, error, refetch } =
    useAnnouncements(params);

  const isFiltered = filters.published !== "all";
  const activeChips = [
    filters.published === "published"
      ? "Published"
      : filters.published === "not"
      ? "Not Published"
      : null,
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
            placeholder="Search announcement name..."
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
          {canCreate && (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      {error ? (
        <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
          <p className="text-sm text-ds-error">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-surface-container-low"
                />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <Megaphone className="h-8 w-8 opacity-40" />
              <p className="mt-2 text-sm">No announcements found.</p>
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
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Status
                    </th>
                    {showActions && (
                      <th className="py-3 pl-4 pr-6 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {announcements.map((a) => (
                    <tr
                      key={a.uuid}
                      className="transition-colors hover:bg-surface-container-low/50"
                    >
                      <td className="py-3 pl-6 pr-4 text-sm font-medium text-on-surface">
                        {a.name}
                      </td>
                      <td className="max-w-md px-4 py-3 text-sm text-on-surface-variant">
                        <span className="line-clamp-2">
                          {a.description || "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-on-surface">
                        {formatRange(a.start_date, a.end_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            a.is_published
                              ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                              : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {a.is_published ? "Published" : "Not Published"}
                        </span>
                      </td>
                      {showActions && (
                        <td className="py-3 pl-4 pr-6">
                          <div className="flex items-center gap-1">
                            {canUpdate && (
                              <button
                                onClick={() => openEdit(a.uuid)}
                                disabled={editLoadingUuid === a.uuid}
                                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
                                title="Edit"
                              >
                                {editLoadingUuid === a.uuid ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Pencil className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDel(a)}
                                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && pagination && pagination.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-on-surface-variant">
                Showing {announcements.length} of {pagination.total} announcements
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
      )}

      <AnnouncementFilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={filters}
        onApply={(next) => {
          setFilters(next);
          setPage(1);
          setIsFilterOpen(false);
        }}
      />

      {del && (
        <DeleteConfirm
          announcement={del}
          onClose={() => setDel(null)}
          onDeleted={() => {
            setDel(null);
            refetch();
          }}
        />
      )}

      {isAddOpen && (
        <AnnouncementFormModal
          onClose={() => setIsAddOpen(false)}
          onSaved={() => {
            setIsAddOpen(false);
            setPage(1);
            refetch();
          }}
        />
      )}

      {edit && (
        <AnnouncementFormModal
          announcement={edit}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
