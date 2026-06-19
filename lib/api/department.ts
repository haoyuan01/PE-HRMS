import { apiClient } from "@/lib/api/client";
import type { Department } from "@/types/department";
import type { Pagination } from "@/types/user";

export interface DepartmentListResponse {
  success: boolean;
  data: Department[];
  pagination: Pagination;
}

export const departmentApi = {
  getDepartments: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    sortBy?: string;
    orderBy?: string;
  }): Promise<DepartmentListResponse> => {
    const query: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 15,
      sortBy: params?.sortBy ?? "created_at",
      orderBy: params?.orderBy ?? "desc",
    };
    if (params?.search) query["search_words[]"] = params.search;

    const response = await apiClient.get<DepartmentListResponse>(
      "/departments",
      { params: query }
    );
    return response.data;
  },

  createDepartment: async (data: {
    name: string;
    description?: string;
  }): Promise<void> => {
    await apiClient.post("/departments", data);
  },

  updateDepartment: async (
    uuid: string,
    data: { name: string; description?: string }
  ): Promise<void> => {
    await apiClient.put(`/departments/${uuid}`, data);
  },

  // Soft-deletes (deactivates) a department via PATCH /departments/{uuid}.
  deleteDepartment: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/departments/${uuid}`, { is_active: false });
  },
};
