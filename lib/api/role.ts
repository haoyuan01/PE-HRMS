import { apiClient } from "@/lib/api/client";
import type { Role } from "@/types/auth";
import type { Pagination } from "@/types/user";

export interface RoleListResponse {
  success: boolean;
  data: Role[];
  pagination: Pagination;
}

export const roleApi = {
  getRoles: async (params?: {
    page?: number;
    per_page?: number;
    name?: string;
  }): Promise<RoleListResponse> => {
    const response = await apiClient.get<RoleListResponse>("/roles", { params });
    return response.data;
  },
};
