import { apiClient } from "@/lib/api/client";
import type { LeaveRequest } from "@/types/leave-request";
import type { ClaimHeader } from "@/types/claim";
import type { Announcement } from "@/types/announcement";

export interface DashboardSummary {
  leave_balance: number;
  pending_leave: number;
  pending_claim: number;
  total_users: number;
  // Leave applied in the current month — added by a future backend update.
  leave_applied?: number;
  latest_payroll: {
    date: string | null;
    attachment_url: string | null;
  } | null;
}

export const dashboardApi = {
  getSummaries: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<{ data: DashboardSummary }>(
      "/dashboards/dashboard-summaries"
    );
    return response.data.data;
  },

  // Latest leave requests for the dashboard: show_all=1 is "Recent Leave
  // Request" (staff), show_all=0 is "My Leave Request".
  getLeaveRequests: async (showAll: boolean): Promise<LeaveRequest[]> => {
    const response = await apiClient.get<{ data: LeaveRequest[] }>(
      "/dashboards/leave-requests",
      { params: { show_all: showAll ? 1 : 0 } }
    );
    return response.data.data ?? [];
  },

  // Latest claims for the dashboard: show_all=1 is "Recent Claim Request"
  // (staff), show_all=0 is "My Claim Request".
  getClaimHeaders: async (showAll: boolean): Promise<ClaimHeader[]> => {
    const response = await apiClient.get<{ data: ClaimHeader[] }>(
      "/dashboards/claim-headers",
      { params: { show_all: showAll ? 1 : 0 } }
    );
    return response.data.data ?? [];
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get<{ data: Announcement[] }>(
      "/dashboards/announcements"
    );
    return response.data.data ?? [];
  },
};
