"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

const FIELD =
  "w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

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

/** month is 1–12 and year a 4-digit year; "all" means not filtered. */
export interface LeaveFilters {
  month: string;
  year: string;
}

export const DEFAULT_LEAVE_FILTERS: LeaveFilters = { month: "all", year: "all" };

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
}

export function LeaveFilterModal({
  onClose,
  onApply,
  initialFilters,
}: LeaveFilterModalProps) {
  const [filters, setFilters] = useState<LeaveFilters>(initialFilters);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => String(currentYear + 1 - i));

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
          <div className="space-y-1.5">
            <label
              htmlFor="leave-filter-month"
              className="text-sm font-medium text-on-surface-variant"
            >
              Month
            </label>
            <select
              id="leave-filter-month"
              value={filters.month}
              onChange={(e) =>
                setFilters((f) => ({
                  month: e.target.value,
                  // Picking a month with no year defaults to this year.
                  year:
                    e.target.value !== "all" && f.year === "all"
                      ? String(currentYear)
                      : f.year,
                }))
              }
              className={FIELD}
            >
              <option value="all">All Months</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={String(i + 1)}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="leave-filter-year"
              className="text-sm font-medium text-on-surface-variant"
            >
              Year
            </label>
            <select
              id="leave-filter-year"
              value={filters.year}
              onChange={(e) =>
                setFilters((f) => ({ ...f, year: e.target.value }))
              }
              className={FIELD}
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
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
