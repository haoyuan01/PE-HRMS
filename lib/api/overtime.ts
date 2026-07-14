import { apiClient } from "@/lib/api/client";

export interface OvertimePayload {
  description: string;
  manager_approver_uuid: string;
}

export const overtimeApi = {
  createOvertime: async (
    data: OvertimePayload,
    attachment?: File
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("manager_approver_uuid", data.manager_approver_uuid);
    if (attachment) formData.append("attachment", attachment);

    await apiClient.post("/overtimes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
