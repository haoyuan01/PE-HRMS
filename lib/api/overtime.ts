import { apiClient } from "@/lib/api/client";
import type { OvertimeListResponse } from "@/types/overtime";

export interface OvertimePayload {
  user_uuid: string;
  description: string;
}

export const overtimeApi = {
  getOvertimes: async (params?: {
    page?: number;
  }): Promise<OvertimeListResponse> => {
    const response = await apiClient.get<OvertimeListResponse>("/overtimes", {
      params: { page: params?.page ?? 1 },
    });
    return response.data;
  },

  createOvertime: async (
    data: OvertimePayload,
    attachment?: File
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("user_uuid", data.user_uuid);
    formData.append("description", data.description);
    if (attachment) formData.append("attachment", attachment);

    await apiClient.post("/overtimes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Director (General Manager) approve/reject — the `approve` boolean decides
  // the outcome; the remark is optional.
  directorReviewOvertime: async (
    uuid: string,
    approve: boolean,
    remark: string
  ): Promise<void> => {
    await apiClient.patch(`/overtimes/director-approves/${uuid}`, {
      approve,
      remark,
    });
  },
};
