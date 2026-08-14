"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardLeaveRequests } from "@/hooks/useDashboardLeaveRequests";
import type { LeaveRequest } from "@/types/leave-request";

function requestStatus(r: LeaveRequest) {
  const handoverRejected =
    !!r.handover_by && !!r.handover_action_at && !r.handover_approved;
  const rejected =
    handoverRejected ||
    (r.manager_action_at && !r.manager_approved) ||
    (r.director_action_at && !r.director_approved);
  if (rejected)
    return { label: "Rejected", className: "bg-ds-error/10 text-ds-error" };
  if (r.manager_approved && r.director_approved)
    return { label: "Approved", className: "bg-emerald-500/10 text-emerald-600" };
  return { label: "Pending", className: "bg-amber-500/10 text-amber-600" };
}

function days(value: string) {
  const n = Number(value);
  return `${n} ${n === 1 ? "day" : "days"}`;
}

function MiniLeaveTable({
  title,
  requests,
  isLoading,
  primaryLabel,
  primary,
  viewMoreHref,
  statusAlign = "right",
}: {
  title: string;
  requests: LeaveRequest[];
  isLoading: boolean;
  primaryLabel: string;
  primary: (r: LeaveRequest) => string;
  viewMoreHref: string;
  statusAlign?: "left" | "right";
}) {
  const rows = requests.slice(0, 4);
  const statusAlignClass = statusAlign === "left" ? "text-left" : "text-right";
  return (
    <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
      <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-3">
        <h3 className="font-display text-sm font-semibold text-on-surface">
          {title}
        </h3>
        <Link
          href={viewMoreHref}
          className="inline-flex items-center gap-0.5 text-xs font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
        >
          View more
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-surface-container-low"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-on-surface-variant">
          No leave requests.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="py-2.5 pl-5 pr-4 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                  {primaryLabel}
                </th>
                <th className="px-4 py-2.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Days
                </th>
                <th className={`py-2.5 pl-4 pr-5 text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant ${statusAlignClass}`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {rows.map((r) => {
                const status = requestStatus(r);
                return (
                  <tr key={r.uuid} className="hover:bg-surface-container-low/50">
                    <td className="py-2.5 pl-5 pr-4 text-sm font-medium text-on-surface">
                      <span className="line-clamp-1">{primary(r)}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm text-on-surface-variant">
                      {days(r.total_days)}
                    </td>
                    <td className={`py-2.5 pl-4 pr-5 ${statusAlignClass}`}>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function LeaveRequestOverview() {
  const canViewRecent = useAuthStore((s) => s.isManager || s.isDirector);
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);

  const my = useDashboardLeaveRequests(true);
  const recent = useDashboardLeaveRequests(false, canViewRecent);

  // The current user's own requests live under "My Leave Request", so keep them
  // out of the recent (staff) list.
  const recentRequests = recent.requests.filter(
    (r) => r.user?.uuid !== currentUserUuid
  );

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Leave Request
      </h2>

      <div
        className={`grid grid-cols-1 gap-4 ${
          canViewRecent ? "lg:grid-cols-2" : ""
        }`}
      >
        {canViewRecent && (
          <MiniLeaveTable
            title="Recent Leave Request"
            requests={recentRequests}
            isLoading={recent.isLoading}
            primaryLabel="Name"
            primary={(r) => r.user?.personal?.full_name ?? r.user?.email ?? "—"}
            viewMoreHref="/dashboard/requests/leave?tab=staff"
            statusAlign="left"
          />
        )}
        <MiniLeaveTable
          title="My Leave Request"
          requests={my.requests}
          isLoading={my.isLoading}
          primaryLabel="Leave Type"
          primary={(r) => r.leave_entitlement?.leave_policy?.name ?? "Leave"}
          viewMoreHref="/dashboard/requests/leave?tab=my"
        />
      </div>
    </div>
  );
}
