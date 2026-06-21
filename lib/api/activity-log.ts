import { apiClient } from "@/lib/api/client";
import type { ActivityLog } from "@/types/activity-log";
import type { Pagination } from "@/types/user";

export interface ActivityLogListResponse {
  success: boolean;
  data: ActivityLog[];
  pagination: Pagination;
}

export const activityLogApi = {
  getActivityLogs: async (params?: {
    page?: number;
    search?: string;
    event?: string;
    sortBy?: string;
    orderBy?: string;
  }): Promise<ActivityLogListResponse> => {
    const query: Record<string, unknown> = {
      page: params?.page ?? 1,
      sortBy: params?.sortBy ?? "created_at",
      orderBy: params?.orderBy ?? "desc",
    };
    if (params?.search) query["search_words[]"] = params.search;
    if (params?.event) query.event = params.event;

    const response = await apiClient.get<ActivityLogListResponse>(
      "/activity-logs",
      { params: query }
    );
    return response.data;
  },
};
