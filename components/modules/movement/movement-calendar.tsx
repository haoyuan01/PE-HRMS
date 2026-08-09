"use client";

import { useCallback, useMemo, useState } from "react";
import { AttendanceCalendar } from "@/components/modules/leave/attendance-calendar";
import { MovementDayModal } from "@/components/modules/movement/movement-day-modal";
import { movementApi } from "@/lib/api/movement";
import type { AttendanceEvent } from "@/types/leave-entitlement";
import type { Movement } from "@/types/movement";

export function MovementCalendar() {
  const [summaries, setSummaries] = useState<Record<string, Movement[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleMonthChange = useCallback(
    async (startDate: string, endDate: string) => {
      setIsLoading(true);
      try {
        setSummaries(
          await movementApi.getCalendarSummaries(startDate, endDate)
        );
      } catch {
        setSummaries({});
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // One chip per movement, labelled with the staff member's full name.
  const events = useMemo(() => {
    const map: Record<string, AttendanceEvent[]> = {};
    for (const [date, movements] of Object.entries(summaries)) {
      if (movements.length) {
        map[date] = movements.map((m) => ({
          label: m.user?.personal?.full_name ?? m.user?.email ?? "—",
          tone: "blue",
        }));
      }
    }
    return map;
  }, [summaries]);

  return (
    <>
      <AttendanceCalendar
        events={events}
        isLoading={isLoading}
        onMonthChange={handleMonthChange}
        onDayClick={setSelectedDate}
      />

      {selectedDate && (
        <MovementDayModal
          date={selectedDate}
          movements={summaries[selectedDate] ?? []}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
