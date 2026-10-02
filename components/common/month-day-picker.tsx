"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

const MONTHS = [
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

// Days offered per month. February allows 29: the value is a recurring
// day-and-month with no year, so a leap-year date is a legitimate choice.
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

interface MonthDayPickerProps {
  /** Month as "1".."12", or "" when nothing is chosen yet. */
  month: string;
  /** Day of that month as a string, or "" when nothing is chosen yet. */
  day: string;
  /** Fires with the new month and day, both as strings. */
  onChange: (month: string, day: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Picks a recurring date — a month and a day, with no year. The field opens a
 * calendar panel inline rather than as a floating popover, so it is never
 * clipped by a scrolling modal body.
 *
 * There is deliberately no weekday row: without a year the weekday of a given
 * date is not knowable, and showing one would be inventing information.
 */
export function MonthDayPicker({
  month,
  day,
  onChange,
  placeholder = "Select date",
  disabled = false,
}: MonthDayPickerProps) {
  const [open, setOpen] = useState(false);
  // Month shown in the panel — follows the selection, else January. Re-centred
  // when the panel opens rather than from an effect.
  const [viewMonth, setViewMonth] = useState(() => (month ? Number(month) : 1));

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setViewMonth(month ? Number(month) : 1);
    setOpen(true);
  };

  const hasValue = month !== "" && day !== "";
  const label = hasValue ? `${day} ${MONTHS[Number(month) - 1]}` : "";
  const dayCount = DAYS_IN_MONTH[viewMonth - 1];

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        // Mirrors components/ui/input.tsx so the field is the same height as the
        // Inputs beside it.
        className="flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-on-surface-variant" />
        <span className={hasValue ? "truncate" : "truncate text-muted-foreground"}>
          {label || placeholder}
        </span>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-3">
          {/* Month navigation — wraps around, since there is no year to leave. */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => (m === 1 ? 12 : m - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-display text-sm font-semibold text-on-surface">
              {MONTHS[viewMonth - 1]}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMonth((m) => (m === 12 ? 1 : m + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                aria-label="Close date picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => {
              const selected = Number(month) === viewMonth && Number(day) === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    onChange(String(viewMonth), String(d));
                    setOpen(false);
                  }}
                  className={`flex h-9 items-center justify-center rounded-lg text-sm transition-colors ${
                    selected
                      ? "bg-ds-primary font-semibold text-on-primary"
                      : "text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
