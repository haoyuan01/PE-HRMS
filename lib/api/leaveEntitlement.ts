import { apiClient } from "@/lib/api/client";
import type { LeaveEntitlementListResponse } from "@/types/leave-entitlement";

export interface LeaveEntitlementPayload {
  used_days: number;
  balance_days: number;
  carry_forward_expiry_date?: string;
}

export const leaveEntitlementApi = {
  // Newest first by default, matching the order the list is expected in.
  // `name` filters server-side on the employee name.
  getLeaveEntitlements: async (params?: {
    user_uuid?: string;
    name?: string;
    sortBy?: string;
    orderBy?: string;
  }): Promise<LeaveEntitlementListResponse> => {
    const query: Record<string, unknown> = {
      sortBy: params?.sortBy ?? "created_at",
      orderBy: params?.orderBy ?? "desc",
    };
    if (params?.user_uuid) query.user_uuid = params.user_uuid;
    if (params?.name) query.name = params.name;

    const response = await apiClient.get<LeaveEntitlementListResponse>(
      "/leave-entitlements",
      { params: query }
    );
    return response.data;
  },

  updateLeaveEntitlement: async (
    uuid: string,
    data: LeaveEntitlementPayload
  ): Promise<void> => {
    await apiClient.put(`/leave-entitlements/${uuid}`, data);
  },
};
