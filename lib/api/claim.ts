import { apiClient } from "@/lib/api/client";
import type { ClaimHeader } from "@/types/claim";
import type { Pagination } from "@/types/user";

export interface ClaimHeaderListResponse {
  success: boolean;
  data: ClaimHeader[];
  pagination: Pagination;
}

export interface ClaimHeaderResponse {
  success: boolean;
  message: string;
  data: ClaimHeader;
}

export interface ClaimItemPayload {
  name: string;
  amount: string;
  date?: string;
  remark?: string;
  attachment?: File;
}

export interface ClaimHeaderPayload {
  name: string;
  manager_approver_uuid: string;
  remark?: string;
  start_date?: string;
  end_date?: string;
  items: ClaimItemPayload[];
}

export const claimApi = {
  createClaimHeader: async (data: ClaimHeaderPayload): Promise<void> => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("manager_approver_uuid", data.manager_approver_uuid);
    formData.append("remark", data.remark ?? "");
    formData.append("start_date", data.start_date ?? "");
    formData.append("end_date", data.end_date ?? "");

    data.items.forEach((item, i) => {
      formData.append(`items[${i}][name]`, item.name);
      formData.append(`items[${i}][amount]`, item.amount);
      formData.append(`items[${i}][date]`, item.date ?? "");
      formData.append(`items[${i}][remark]`, item.remark ?? "");
      if (item.attachment instanceof File) {
        formData.append(`items[${i}][attachment]`, item.attachment);
      }
    });

    await apiClient.post("/claim-headers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getClaimHeader: async (uuid: string): Promise<ClaimHeader> => {
    const response = await apiClient.get<ClaimHeaderResponse>(
      `/claim-headers/${uuid}`
    );
    return response.data.data;
  },

  // Manager approval/rejection share one endpoint — the `approve` boolean
  // decides the outcome.
  approveClaimItem: async (itemUuid: string): Promise<void> => {
    await apiClient.patch(`/claim-items/manager-approves/${itemUuid}`, {
      approve: true,
    });
  },

  rejectClaimItem: async (itemUuid: string): Promise<void> => {
    await apiClient.patch(`/claim-items/manager-approves/${itemUuid}`, {
      approve: false,
    });
  },

  // Director (General Manager) approval/rejection — mirrors the manager
  // endpoint, keyed by the `approve` boolean.
  directorApproveClaimItem: async (itemUuid: string): Promise<void> => {
    await apiClient.patch(`/claim-items/director-approves/${itemUuid}`, {
      approve: true,
    });
  },

  directorRejectClaimItem: async (itemUuid: string): Promise<void> => {
    await apiClient.patch(`/claim-items/director-approves/${itemUuid}`, {
      approve: false,
    });
  },

  // Manager "Reviewed" action — a single header-level call that finalises the
  // manager's review of the whole claim (no body).
  managerReviewClaim: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/claim-headers/manager-reviews/${uuid}`);
  },

  // Director (General Manager) "Reviewed" action — header-level, no body.
  directorReviewClaim: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/claim-headers/director-reviews/${uuid}`);
  },

  getClaimHeaders: async (params?: {
    page?: number;
    user_uuid?: string;
    manager_approver_uuid?: string;
    is_director?: boolean;
    name?: string;
  }): Promise<ClaimHeaderListResponse> => {
    const query: Record<string, unknown> = { page: params?.page ?? 1 };
    if (params?.user_uuid) query.user_uuid = params.user_uuid;
    if (params?.manager_approver_uuid)
      query.manager_approver_uuid = params.manager_approver_uuid;
    if (params?.is_director) query.is_director = 1;
    if (params?.name) query.name = params.name;

    const response = await apiClient.get<ClaimHeaderListResponse>(
      "/claim-headers",
      { params: query }
    );
    return response.data;
  },
};
