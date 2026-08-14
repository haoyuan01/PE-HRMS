"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { EventBanner } from "@/components/modules/dashboard/event-banner";
import { AnnouncementOverview } from "@/components/modules/dashboard/announcement-overview";
import { OverallInformation } from "@/components/modules/dashboard/overall-information";
import { LeaveBalance } from "@/components/modules/dashboard/leave-balance";
import { LeaveRequestOverview } from "@/components/modules/dashboard/leave-request-overview";
import { ClaimRequestOverview } from "@/components/modules/dashboard/claim-request-overview";
import { StaffMovementOverview } from "@/components/modules/dashboard/staff-movement-overview";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Workspace Overview
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Welcome back{user?.personal?.first_name ? `, ${user.personal.first_name}` : ""}. Here is
          what is happening with your organization today.
        </p>
      </div>

      {/* Upcoming event slideshow banner */}
      <EventBanner />

      {/* Announcement table (click a row for details) */}
      <AnnouncementOverview />

      {/* Overall information summary cards */}
      <OverallInformation />

      {/* User's leave balance per leave type */}
      <LeaveBalance />

      {/* Recent (manager/director) + my leave requests */}
      <LeaveRequestOverview />

      {/* Recent (accountant/director) + my claim requests */}
      <ClaimRequestOverview />

      {/* Staff movement — only for users with movement_read */}
      <StaffMovementOverview />
    </div>
  );
}
