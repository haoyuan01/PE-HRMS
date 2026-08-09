"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, FileText, Download, Plus, SlidersHorizontal, X, Search, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePayrollUsers } from "@/hooks/usePayrollUsers";
import { payrollApi } from "@/lib/api/payroll";
import { PayslipFormModal } from "@/components/modules/payslip/payslip-form-modal";
import {
  PayslipFilterModal,
  type PayslipFilters,
} from "@/components/modules/payslip/payslip-filter-modal";
import type { PayrollItem, PayrollUser } from "@/types/payroll";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// A payroll counts as "published" for the selected month when the record exists
// and isn't explicitly flagged unpublished.
function isPublished(payroll?: PayrollItem) {
  return !!payroll && payroll.is_published !== false;
}

function Avatar({ user }: { user: PayrollUser }) {
  const [failed, setFailed] = useState(false);
  const personal = user.personal;
  const name = personal?.full_name ?? user.email;
  const image = personal?.image_path;
  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    (user.email[0]?.toUpperCase() ?? "?");
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

function DeleteConfirm({
  payroll,
  period,
  onClose,
  onDeleted,
}: {
  payroll: PayrollItem;
  period: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const remove = async () => {
    setIsDeleting(true);
    try {
      await payrollApi.deletePayroll(payroll.uuid);
      toast.success("Payslip deleted.");
      onDeleted();
    } catch {
      toast.error("Failed to delete payslip.");
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
          Delete Payslip
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Are you sure you want to delete the payslip for{" "}
          <span className="font-medium text-on-surface">{period}</span>?
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

export function PayrollStaffList() {
  const now = new Date();
  const defaultFilters: PayslipFilters = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    department: "all",
    branch: "all",
    status: "all",
  };
  const [filters, setFilters] = useState<PayslipFilters>(defaultFilters);
  const { month, year, department, branch, status } = filters;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addFor, setAddFor] = useState<PayrollUser | null>(null);
  const [del, setDel] = useState<{ payroll: PayrollItem; period: string } | null>(
    null
  );
  const [edit, setEdit] = useState<{ user: PayrollUser; payroll: PayrollItem } | null>(
    null
  );
  const PAGE_SIZE = 10;

  const isFiltered =
    month !== defaultFilters.month ||
    year !== defaultFilters.year ||
    department !== "all" ||
    branch !== "all" ||
    status !== "all";

  // 0 means "All" — omit the param so the backend doesn't filter by it.
  const { users, isLoading, error, refetch } = usePayrollUsers({
    month: month || undefined,
    year: year || undefined,
  });

  const years = useMemo(() => {
    const current = now.getFullYear();
    return Array.from({ length: 6 }, (_, i) => current - i);
  }, [now]);

  // Department / branch options derived from the loaded users.
  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          users
            .map((u) => u.employment?.department?.name)
            .filter((n): n is string => !!n)
        )
      ).sort(),
    [users]
  );
  const branches = useMemo(
    () =>
      Array.from(
        new Set(
          users
            .map((u) => u.employment?.office?.name)
            .filter((n): n is string => !!n)
        )
      ).sort(),
    [users]
  );

  // Precompute each row's period-filtered payrolls + published status, then
  // apply the department / branch / status filters.
  const rows = useMemo(() => {
    return users
      .map((u) => {
        const payrolls = (u.payrolls ?? []).filter(
          (p) =>
            (!month || Number(p.month) === month) &&
            (!year || Number(p.year) === year)
        );
        return { u, payrolls, published: payrolls.some(isPublished) };
      })
      .filter(({ u, published }) => {
        if (department !== "all" && u.employment?.department?.name !== department)
          return false;
        if (branch !== "all" && u.employment?.office?.name !== branch)
          return false;
        if (status === "published" && !published) return false;
        if (status === "not" && published) return false;
        const q = search.trim().toLowerCase();
        if (
          q &&
          !(u.personal?.full_name ?? u.email).toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q)
        )
          return false;
        return true;
      });
  }, [users, month, year, department, branch, status, search]);

  // Reset to the first page whenever the filtered result set changes.
  useEffect(() => {
    setPage(1);
  }, [month, year, department, branch, status, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = rows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggle = (uuid: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(uuid) ? next.delete(uuid) : next.add(uuid);
      return next;
    });

  const periodLabel =
    month && year
      ? `${MONTHS[month - 1]} ${year}`
      : year
      ? `${year}`
      : month
      ? MONTHS[month - 1]
      : "any period";

  // Chips summarising the applied filters, shown next to the Filters button.
  const activeChips = [
    periodLabel,
    department !== "all" ? department : null,
    branch !== "all" ? branch : null,
    status === "published"
      ? "Published"
      : status === "not"
      ? "Not Published"
      : null,
  ].filter((c): c is string => !!c);

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search staff name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              onClick={() => setFilters(defaultFilters)}
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
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <p className="text-sm">No employees found.</p>
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
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Branch Office
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Status
                  </th>
                  <th className="py-3 pl-4 pr-6 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {pagedRows.map(({ u, payrolls, published }) => {
                  const isOpen = expanded.has(u.uuid);
                  return (
                    <Fragment key={u.uuid}>
                      <tr className="transition-colors hover:bg-surface-container-low/50">
                        <td className="py-3 pl-6 pr-4 text-sm">
                          <div className="flex items-center gap-3">
                            <Avatar user={u} />
                            <p className="min-w-0 truncate font-medium text-on-surface">
                              {u.personal?.full_name ?? u.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">
                          {u.employment?.department?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">
                          {u.employment?.office?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              published
                                ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {published ? "Published" : "Not Published"}
                          </span>
                        </td>
                        <td className="py-3 pl-4 pr-6">
                          <button
                            onClick={() => toggle(u.uuid)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
                          >
                            View Payslip
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-surface-container-low/30">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-lowest">
                              {payrolls.length > 0 ? (
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-outline-variant/20 bg-surface-container-low/60">
                                      <th className="py-2 pl-6 pr-4 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                        Period
                                      </th>
                                      <th className="px-4 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                        Payslip
                                      </th>
                                      <th className="px-4 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                        Status
                                      </th>
                                      <th className="px-4 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                        Remark
                                      </th>
                                      <th className="py-2 pl-4 pr-6 text-right text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-outline-variant/20">
                                    {payrolls.map((p) => {
                                      const rowPeriod = p.month
                                        ? `${MONTHS[Number(p.month) - 1] ?? p.month} ${p.year ?? year}`
                                        : periodLabel;
                                      return (
                                      <tr
                                        key={p.uuid}
                                        className="bg-surface-container-lowest"
                                      >
                                        <td className="py-2.5 pl-6 pr-4 text-xs font-medium text-on-surface">
                                          {rowPeriod}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs">
                                          {p.attachment_path ? (
                                            <a
                                              href={p.attachment_path}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 text-xs font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
                                            >
                                              <Download className="h-3.5 w-3.5" />
                                              View
                                            </a>
                                          ) : (
                                            <span className="text-xs text-on-surface-variant">
                                              —
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs">
                                          <span
                                            className={
                                              isPublished(p)
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-on-surface-variant"
                                            }
                                          >
                                            {isPublished(p)
                                              ? "Published"
                                              : "Not Published"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-xs text-on-surface-variant">
                                          {p.remark || "—"}
                                        </td>
                                        <td className="py-2.5 pl-4 pr-6 text-right">
                                          <div className="flex items-center justify-end gap-1">
                                            <button
                                              onClick={() =>
                                                setEdit({ user: u, payroll: p })
                                              }
                                              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                                              title="Edit"
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                setDel({ payroll: p, period: rowPeriod })
                                              }
                                              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                                              title="Delete"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-on-surface-variant">
                                  <FileText className="h-4 w-4 opacity-50" />
                                  No payslip published for {periodLabel}.
                                </div>
                              )}
                              {/* Full-width add line */}
                              <button
                                onClick={() => setAddFor(u)}
                                className={`flex w-full items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-ds-primary transition-colors hover:bg-surface-container-low ${
                                  payrolls.length > 0
                                    ? "border-t border-outline-variant/20"
                                    : ""
                                }`}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add New Payslip
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!error && !isLoading && rows.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-on-surface-variant">
              Showing {pagedRows.length} of {rows.length} staff
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
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {del && (
        <DeleteConfirm
          payroll={del.payroll}
          period={del.period}
          onClose={() => setDel(null)}
          onDeleted={() => {
            setDel(null);
            refetch();
          }}
        />
      )}

      <PayslipFilterModal
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={filters}
        years={years}
        departments={departments}
        branches={branches}
        onApply={(next) => {
          setFilters(next);
          setIsFilterOpen(false);
        }}
      />

      {addFor && (
        <PayslipFormModal
          userUuid={addFor.uuid}
          userName={addFor.personal?.full_name ?? addFor.email}
          defaultMonth={month || now.getMonth() + 1}
          defaultYear={year || now.getFullYear()}
          onClose={() => setAddFor(null)}
          onSaved={() => {
            setAddFor(null);
            refetch();
          }}
        />
      )}

      {edit && (
        <PayslipFormModal
          userUuid={edit.user.uuid}
          userName={edit.user.personal?.full_name ?? edit.user.email}
          defaultMonth={month || now.getMonth() + 1}
          defaultYear={year || now.getFullYear()}
          payroll={edit.payroll}
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
