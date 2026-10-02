"use client";

import { useEffect, useState } from "react";
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
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { AttendanceEvent } from "@/types/leave-entitlement";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TONE_CLASSES: Record<NonNullable<AttendanceEvent["tone"]>, string> = {
  amber: "bg-amber-500/10 text-amber-600",
  red: "bg-ds-error/10 text-ds-error",
  blue: "bg-blue-500/10 text-blue-600",
  green: "bg-emerald-500/10 text-emerald-600",
};

// Solid fills for the mobile dots — the tinted chip backgrounds above are far
// too faint at 6px.
const TONE_DOTS: Record<NonNullable<AttendanceEvent["tone"]>, string> = {
  amber: "bg-amber-500",
  red: "bg-ds-error",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
};

// Dots shown before collapsing the rest into a "+N" count.
const MAX_DOTS = 3;

interface AttendanceCalendarProps {
  // Leave events keyed by "yyyy-MM-dd".
  events?: Record<string, AttendanceEvent[]>;
  isLoading?: boolean;
  // Fires on mount and whenever the visible month changes, with the month's
  // first/last day as "yyyy-MM-dd" so the parent can fetch that range.
  onMonthChange?: (startDate: string, endDate: string) => void;
  // Fires when a day that has events is clicked, with its "yyyy-MM-dd" key.
  onDayClick?: (date: string) => void;
}

export function AttendanceCalendar({
  events = {},
  isLoading = false,
  onMonthChange,
  onDayClick,
}: AttendanceCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    onMonthChange?.(
      format(startOfMonth(month), "yyyy-MM-dd"),
      format(endOfMonth(month), "yyyy-MM-dd")
    );
  }, [month, onMonthChange]);

  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold text-on-surface">
            Attendance Overview
          </h2>
          <p className="text-xs text-on-surface-variant">
            {format(month, "MMMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isLoading && (
            <Loader2 className="mr-1 h-4 w-4 animate-spin text-on-surface-variant" />
          )}
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-outline-variant/20 pb-2">
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
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = events[key] ?? [];
          const inMonth = isSameMonth(day, month);
          const clickable = dayEvents.length > 0 && !!onDayClick;
          return (
            <div
              key={key}
              onClick={clickable ? () => onDayClick?.(key) : undefined}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") onDayClick?.(key);
                    }
                  : undefined
              }
              className={`min-h-[56px] border-b border-r border-outline-variant/10 p-1.5 first:border-l md:min-h-[76px] ${
                inMonth ? "" : "bg-surface-container-low/40"
              } ${
                clickable
                  ? "cursor-pointer transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-inset focus:ring-ds-primary/40"
                  : ""
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday(day)
                    ? "bg-ds-primary font-semibold text-on-primary"
                    : inMonth
                      ? "text-on-surface"
                      : "text-on-surface-variant/40"
                }`}
              >
                {format(day, "d")}
              </span>
              {/* Dots below md: a 7-column grid leaves ~45px per cell on a
                  phone, where a chip truncates to about two characters. Tapping
                  the day opens the full list, so the dots only need to say that
                  something is there. */}
              {dayEvents.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1 md:hidden">
                  {dayEvents.slice(0, MAX_DOTS).map((event, i) => (
                    <span
                      key={i}
                      title={event.label}
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        TONE_DOTS[event.tone ?? "amber"]
                      }`}
                    />
                  ))}
                  {dayEvents.length > MAX_DOTS && (
                    <span className="text-[0.6rem] font-medium leading-none text-on-surface-variant">
                      +{dayEvents.length - MAX_DOTS}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-1 hidden space-y-1 md:block">
                {dayEvents.map((event, i) => (
                  <div
                    key={i}
                    className={`truncate rounded px-1.5 py-0.5 text-[0.65rem] font-medium ${
                      TONE_CLASSES[event.tone ?? "amber"]
                    }`}
                    title={event.label}
                  >
                    {event.label}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
