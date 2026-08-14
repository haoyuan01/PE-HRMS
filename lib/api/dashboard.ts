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

  // Leave requests for the dashboard. relevant_to_me scopes to the current
  // user's own requests ("My"); omitted returns the recent staff requests.
  getLeaveRequests: async (relevantToMe = false): Promise<LeaveRequest[]> => {
    const response = await apiClient.get<{ data: LeaveRequest[] }>(
      "/dashboards/leave-requests",
      { params: relevantToMe ? { relevant_to_me: 1 } : {} }
    );
    return response.data.data ?? [];
  },

  getClaimHeaders: async (relevantToMe = false): Promise<ClaimHeader[]> => {
    const response = await apiClient.get<{ data: ClaimHeader[] }>(
      "/dashboards/claim-headers",
      { params: relevantToMe ? { relevant_to_me: 1 } : {} }
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
