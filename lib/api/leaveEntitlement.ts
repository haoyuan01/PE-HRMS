import { apiClient } from "@/lib/api/client";
import type { LeaveEntitlementListResponse } from "@/types/leave-entitlement";

export interface LeaveEntitlementPayload {
  entitled_days: number;
  carried_forward_days: number;
  used_days: number;
  balance_days: number;
  carry_forward_expiry_date?: string;
}

export const leaveEntitlementApi = {
  getLeaveEntitlements: async (params?: {
    user_uuid?: string;
  }): Promise<LeaveEntitlementListResponse> => {
    const query: Record<string, unknown> = {};
    if (params?.user_uuid) query.user_uuid = params.user_uuid;

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
