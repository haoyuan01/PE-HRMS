import { apiClient } from "@/lib/api/client";
import type { PayrollListResponse, PayrollUser } from "@/types/payroll";

export interface PayrollUsersParams {
  month?: number;
  year?: number;
  user_uuid?: string;
  is_published?: boolean;
}

export interface CreatePayrollPayload {
  user_uuid: string;
  month: number;
  year: number;
  remark: string;
  is_published: boolean;
}

export const payrollApi = {
  // All users with their nested payrolls for the given month/year (staff list).
  getPayrollUsers: async (
    params?: PayrollUsersParams
  ): Promise<PayrollUser[]> => {
    const response = await apiClient.get<PayrollListResponse>("/payrolls", {
      params,
    });
    const data = response.data.data;
    return Array.isArray(data) ? data : [data];
  },

  createPayroll: async (
    data: CreatePayrollPayload,
    attachment: File
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("user_uuid", data.user_uuid);
    formData.append("month", String(data.month));
    formData.append("year", String(data.year));
    formData.append("remark", data.remark);
    formData.append("is_published", data.is_published ? "1" : "0");
    formData.append("attachment", attachment);

    await apiClient.post("/payrolls", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
