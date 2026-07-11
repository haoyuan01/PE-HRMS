import { apiClient } from "@/lib/api/client";
import type { LeavePolicyListResponse } from "@/types/leave-policy";

export interface LeavePolicyTierPayload {
  service_year_from: number;
  service_year_to: number;
  entitlement_days: number;
}

export interface LeavePolicyPayload {
  name: string;
  code: string;
  description: string;
  allow_half_day: boolean;
  carry_forward_days: number;
  // The backend validates these as 1-12 / 1-31 only when present, so they are
  // omitted entirely (not sent as 0) when the policy has no carry-forward expiry.
  carry_forward_expiry_month?: number;
  carry_forward_expiry_date?: number;
  is_handover_required: boolean;
  handover_min_days: number;
  min_notice_days: number;
  requires_attachment: boolean;
  is_paid: boolean;
  leave_policy_tiers: LeavePolicyTierPayload[];
}

export const leavePolicyApi = {
  getLeavePolicies: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    sortBy?: string;
    orderBy?: string;
  }): Promise<LeavePolicyListResponse> => {
    const query: Record<string, unknown> = { page: params?.page ?? 1 };
    if (params?.size) query.size = params.size;
    // The backend expects the search term as search_words[] (array form).
    if (params?.search) query.search_words = [params.search];
    if (params?.sortBy) query.sortBy = params.sortBy;
    if (params?.orderBy) query.orderBy = params.orderBy;

    const response = await apiClient.get<LeavePolicyListResponse>(
      "/leave-policies",
      { params: query }
    );
    return response.data;
  },

  createLeavePolicy: async (data: LeavePolicyPayload): Promise<void> => {
    await apiClient.post("/leave-policies", data);
  },

  updateLeavePolicy: async (
    uuid: string,
    data: LeavePolicyPayload
  ): Promise<void> => {
    await apiClient.put(`/leave-policies/${uuid}`, data);
  },

  // Soft-delete — deactivates the policy.
  deleteLeavePolicy: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/leave-policies/${uuid}`, { is_active: false });
  },
};
