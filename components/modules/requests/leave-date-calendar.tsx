"use client";

import { useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isWeekend,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface LeaveDateCalendarProps {
  // Selected dates as "yyyy-MM-dd".
  selected: string[];
  onToggle: (date: string) => void;
  // Earliest selectable date ("yyyy-MM-dd"); earlier days are disabled.
  minDate?: string;
  disabled?: boolean;
}

export function LeaveDateCalendar({
  selected,
  onToggle,
  minDate,
  disabled = false,
}: LeaveDateCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const selectedSet = new Set(selected);

  return (
    <div
      className={`rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-4 ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-on-surface">
          {format(month, "MMMM yyyy")}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, month);
          const isSelected = selectedSet.has(key);
          const tooEarly = !!minDate && key < minDate;
          // Weekends aren't working days, so they can't be leave dates.
          const dayDisabled = tooEarly || isWeekend(day);
          return (
            <button
              key={key}
              type="button"
              disabled={dayDisabled}
              onClick={() => onToggle(key)}
              className={`flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
                isSelected
                  ? "bg-ds-primary font-semibold text-on-primary"
                  : dayDisabled
                    ? "cursor-not-allowed text-on-surface-variant/30"
                    : inMonth
                      ? "text-on-surface hover:bg-surface-container-high"
                      : "text-on-surface-variant/40 hover:bg-surface-container-high"
              } ${
                isToday(day) && !isSelected
                  ? "ring-1 ring-inset ring-ds-primary/40"
                  : ""
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
