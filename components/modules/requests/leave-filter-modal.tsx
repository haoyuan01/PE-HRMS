"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { FormSelect, type SelectOption } from "@/components/common/form-select";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** The API's status values; "all" sends no status. */
export type LeaveStatusFilter = "all" | "pending" | "approved" | "reject";

export const LEAVE_STATUS_OPTIONS: {
  value: LeaveStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "reject", label: "Rejected" },
];

/** month is 1–12 and year a 4-digit year; "all" means not filtered. */
export interface LeaveFilters {
  month: string;
  year: string;
  /** "all", or an API status value (leave: LeaveStatusFilter; claims: their own). */
  status: string;
}

export const DEFAULT_LEAVE_FILTERS: LeaveFilters = {
  month: "all",
  year: "all",
  status: "all",
};

/** The API's status value, or null to show every status. */
export function toStatus(filters: LeaveFilters): string | null {
  return filters.status === "all" ? null : filters.status;
}

/** The API's month_year value ("MM-YYYY"), or null to show every month. */
export function toMonthYear(filters: LeaveFilters): string | null {
  if (filters.month === "all" || filters.year === "all") return null;
  return `${filters.month.padStart(2, "0")}-${filters.year}`;
}

// Mount this only while it is open: it copies initialFilters once, on mount,
// so closing without Apply discards the unsaved choices.
interface LeaveFilterModalProps {
  onClose: () => void;
  onApply: (filters: LeaveFilters) => void;
  initialFilters: LeaveFilters;
  /** Status is a Staff List filter; hide it on My List. */
  showStatus: boolean;
  /** Month and Year fields; off for status-only filters (expense claims). */
  showPeriod?: boolean;
  /** Status choices; defaults to the leave statuses. */
  statusOptions?: SelectOption[];
}

export function LeaveFilterModal({
  onClose,
  onApply,
  initialFilters,
  showStatus,
  showPeriod = true,
  statusOptions = LEAVE_STATUS_OPTIONS,
}: LeaveFilterModalProps) {
  const [filters, setFilters] = useState<LeaveFilters>(initialFilters);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) =>
    String(currentYear + 1 - i),
  );
  const monthOptions: SelectOption[] = [
    { value: "all", label: "All Months" },
    ...MONTH_NAMES.map((name, i) => ({ value: String(i + 1), label: name })),
  ];
  const yearOptions: SelectOption[] = [
    { value: "all", label: "All Years" },
    ...years.map((y) => ({ value: y, label: y })),
  ];

  // The API filters by month and year together, so both or neither.
  const isIncomplete = (filters.month === "all") !== (filters.year === "all");

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-on-surface">
            Filters
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Fields */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {showPeriod && (
            <>
              <FormSelect
                label="Month"
                value={filters.month}
                options={monthOptions}
                onChange={(month) =>
                  setFilters((f) => ({
                    ...f,
                    month,
                    // Picking a month with no year defaults to this year.
                    year:
                      month !== "all" && f.year === "all"
                        ? String(currentYear)
                        : f.year,
                  }))
                }
              />
              <FormSelect
                label="Year"
                value={filters.year}
                options={yearOptions}
                onChange={(year) => setFilters((f) => ({ ...f, year }))}
              />
            </>
          )}
          {showStatus && (
            <FormSelect
              label="Status"
              className="sm:col-span-2"
              value={filters.status}
              options={statusOptions}
              onChange={(status) => setFilters((f) => ({ ...f, status }))}
            />
          )}
        </div>

        {isIncomplete && (
          <p className="mt-3 text-xs text-ds-error">
            Choose both a month and a year, or set both to All.
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(filters)}
            disabled={isIncomplete}
            className="rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
