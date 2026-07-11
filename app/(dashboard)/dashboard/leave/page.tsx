"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useLeaveEntitlements } from "@/hooks/useLeaveEntitlements";
import { usePermissions } from "@/hooks/usePermissions";
import { leaveRequestApi } from "@/lib/api/leaveRequest";
import { AttendanceCalendar } from "@/components/modules/leave/attendance-calendar";
import { LeaveEntitlementTable } from "@/components/modules/leave/leave-entitlement-table";
import { LeaveDayModal } from "@/components/modules/leave/leave-day-modal";
import { LeaveEntitlementEditModal } from "@/components/modules/leave/leave-entitlement-edit-modal";
import type {
  AttendanceEvent,
  LeaveEntitlementUser,
} from "@/types/leave-entitlement";
import type { CalendarDaySummary } from "@/types/leave-request";

export default function LeaveEntitlementPage() {
  const { can } = usePermissions();
  const canEdit = can("leave_entitlement_update");
  const { users, policyColumns, isLoading, error, refetch } =
    useLeaveEntitlements();
  const [search, setSearch] = useState("");

  const [summaries, setSummaries] = useState<
    Record<string, CalendarDaySummary>
  >({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<LeaveEntitlementUser | null>(null);

  // Fetch the attendance summary for the calendar's visible month.
  const handleMonthChange = useCallback(
    async (startDate: string, endDate: string) => {
      setCalendarLoading(true);
      try {
        setSummaries(
          await leaveRequestApi.getCalendarSummaries(startDate, endDate)
        );
      } catch {
        setSummaries({});
      } finally {
        setCalendarLoading(false);
      }
    },
    []
  );

  // Chips (counts) derived from the day summaries.
  const calendarEvents = useMemo(() => {
    const events: Record<string, AttendanceEvent[]> = {};
    for (const [date, summary] of Object.entries(summaries)) {
      if (summary.total > 0) {
        events[date] = [{ label: `${summary.total} On Leave`, tone: "amber" }];
      }
    }
    return events;
  }, [summaries]);

  // Client-side name/email filter over the loaded entitlement rows.
  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const name = u.personal?.full_name ?? u.email;
      return (
        name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Leave Entitlement
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          View and manage leave balances and entitlements.
        </p>
      </div>

      {/* Attendance calendar — fetches per-day leave counts on month change. */}
      <AttendanceCalendar
        events={calendarEvents}
        isLoading={calendarLoading}
        onMonthChange={handleMonthChange}
        onDayClick={setSelectedDate}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border-0 bg-surface-container-low pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-ds-primary/30 transition-all"
          />
        </div>

        <button
          onClick={() => toast.info("Filters are coming soon.")}
          className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>
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
          <LeaveEntitlementTable
            users={visibleUsers}
            policyColumns={policyColumns}
            isLoading={isLoading}
            canEdit={canEdit}
            onEdit={setEditUser}
          />
        )}
      </div>

      {/* Day detail modal — who's on leave on the clicked date */}
      {selectedDate && (
        <LeaveDayModal
          date={selectedDate}
          requests={summaries[selectedDate]?.leave_requests ?? []}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Edit entitlement modal */}
      {editUser && (
        <LeaveEntitlementEditModal
          user={editUser}
          policies={policyColumns}
          onClose={() => setEditUser(null)}
          onSaved={() => {
            setEditUser(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
