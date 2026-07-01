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

  getClaimHeaders: async (params?: {
    page?: number;
    user_uuid?: string;
  }): Promise<ClaimHeaderListResponse> => {
    const query: Record<string, unknown> = { page: params?.page ?? 1 };
    if (params?.user_uuid) query.user_uuid = params.user_uuid;

    const response = await apiClient.get<ClaimHeaderListResponse>(
      "/claim-headers",
      { params: query }
    );
    return response.data;
  },
};
