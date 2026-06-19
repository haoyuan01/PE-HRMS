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

  // Soft-deletes (deactivates) a role via PATCH /roles/{uuid}. The PIN is
  // forwarded for the upcoming security-PIN check; the backend ignores it for
  // now but will validate it in the future.
  deleteRole: async (uuid: string, pin?: string): Promise<void> => {
    await apiClient.patch(`/roles/${uuid}`, { is_active: false, pin });
  },

  // Requests a security-PIN reset email for the current user. The backend
  // endpoint is not available yet — this is a placeholder to be wired up once
  // it is ready, e.g. await apiClient.post("/security-pin/reset").
  requestSecurityPinReset: async (): Promise<void> => {
    // TODO: call the real endpoint when available.
  },
};
