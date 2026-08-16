import { apiClient } from "@/lib/api/client";
import type { Pagination } from "@/types/user";
import type {
  CalendarDaySummary,
  CalendarSummaryResponse,
  LeaveRequest,
  LeaveRequestDetail,
  LeaveStatusSummary,
} from "@/types/leave-request";

export interface LeaveRequestListResponse {
  success: boolean;
  data: LeaveRequest[];
  pagination: Pagination;
}

// One leave day. `if_first_half` intentionally matches the backend's spelling.
export interface LeaveRequestDate {
  date: string;
  is_half_day: boolean;
  if_first_half: boolean;
}

export interface LeaveRequestPayload {
  manager_approver_uuid: string;
  leave_entitlement_uuid: string;
  resume_date: string;
  total_days: number;
  reason: string;
  request_dates: LeaveRequestDate[];
  handover_by_uuid?: string;
  handover_remark?: string;
}

export const leaveRequestApi = {
  // Per-day leave summaries for the given (inclusive) date range, e.g. a month.
  getCalendarSummaries: async (
    startDate: string,
    endDate: string
  ): Promise<Record<string, CalendarDaySummary>> => {
    const response = await apiClient.get<CalendarSummaryResponse>(
      "/leave-requests/calendar-summaries",
      { params: { start_date: startDate, end_date: endDate } }
    );
    return response.data.data;
  },

  // Totals shown in the cards above the Leave Requests table.
  getStatusSummaries: async (): Promise<LeaveStatusSummary> => {
    const response = await apiClient.get<{ data: LeaveStatusSummary }>(
      "/leave-requests/status-summaries"
    );
    return response.data.data;
  },

  getLeaveRequests: async (params?: {
    page?: number;
    user_uuid?: string;
    manager_approver_uuid?: string;
    is_director?: boolean;
  }): Promise<LeaveRequestListResponse> => {
    const query: Record<string, unknown> = { page: params?.page ?? 1 };
    if (params?.user_uuid) query.user_uuid = params.user_uuid;
    if (params?.manager_approver_uuid)
      query.manager_approver_uuid = params.manager_approver_uuid;
    if (params?.is_director) query.is_director = 1;

    const response = await apiClient.get<LeaveRequestListResponse>(
      "/leave-requests",
      { params: query }
    );
    return response.data;
  },

  getLeaveRequest: async (uuid: string): Promise<LeaveRequestDetail> => {
    const response = await apiClient.get<{ data: LeaveRequestDetail }>(
      `/leave-requests/${uuid}`
    );
    return response.data.data;
  },

  // Manager approve/reject — the `approve` boolean decides the outcome.
  managerReviewLeaveRequest: async (
    uuid: string,
    approve: boolean,
    remark: string
  ): Promise<void> => {
    await apiClient.patch(`/leave-requests/manager-approves/${uuid}`, {
      approve,
      remark,
    });
  },

  // Director (General Manager) approve/reject — mirrors the manager endpoint.
  directorReviewLeaveRequest: async (
    uuid: string,
    approve: boolean,
    remark: string
  ): Promise<void> => {
    await apiClient.patch(`/leave-requests/director-approves/${uuid}`, {
      approve,
      remark,
    });
  },

  createLeaveRequest: async (
    data: LeaveRequestPayload,
    attachment?: File
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("manager_approver_uuid", data.manager_approver_uuid);
    formData.append("leave_entitlement_uuid", data.leave_entitlement_uuid);
    formData.append("resume_date", data.resume_date);
    formData.append("total_days", String(data.total_days));
    formData.append("reason", data.reason);
    data.request_dates.forEach((d, i) => {
      formData.append(`request_dates[${i}][date]`, d.date);
      formData.append(`request_dates[${i}][is_half_day]`, d.is_half_day ? "1" : "0");
      formData.append(`request_dates[${i}][if_first_half]`, d.if_first_half ? "1" : "0");
    });
    if (data.handover_by_uuid)
      formData.append("handover_by_uuid", data.handover_by_uuid);
    if (data.handover_remark)
      formData.append("handover_remark", data.handover_remark);
    if (attachment) formData.append("attachment", attachment);
    formData.append("_method", "POST");

    await apiClient.post("/leave-requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Downloads the leave requests as an Excel file. Omitting relevant_to_me
  // exports the staff list; passing it exports the current user's own ("My").
  exportExcel: async (params: {
    created_from?: string;
    created_to?: string;
    relevant_to_me?: boolean;
  }): Promise<void> => {
    const response = await apiClient.get("/leave-requests/export-excel", {
      params: {
        ...(params.created_from ? { created_from: params.created_from } : {}),
        ...(params.created_to ? { created_to: params.created_to } : {}),
        ...(params.relevant_to_me ? { relevant_to_me: 1 } : {}),
      },
      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"] as
      | string
      | undefined;
    const match = disposition?.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] ?? "leave-requests.xlsx";

    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
