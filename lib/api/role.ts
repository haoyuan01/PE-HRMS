import { apiClient } from "@/lib/api/client";
import type { Role } from "@/types/auth";
import type { Pagination } from "@/types/user";

export interface RoleListResponse {
  success: boolean;
  data: Role[];
  pagination: Pagination;
}

export interface RoleResponse {
  success: boolean;
  message: string;
  data: Role;
}

export interface RolePayload {
  name: string;
  permissions: { uuid: string }[];
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

  getRole: async (uuid: string): Promise<Role> => {
    const response = await apiClient.get<RoleResponse>(`/roles/${uuid}`);
    return response.data.data;
  },

  createRole: async (data: RolePayload): Promise<void> => {
    await apiClient.post("/roles", data);
  },

  updateRole: async (uuid: string, data: RolePayload): Promise<void> => {
    await apiClient.put(`/roles/${uuid}`, data);
  },

  // Soft-deletes (deactivates) a role via PATCH /roles/{uuid}. The security PIN
  // is sent as the numeric `passcode` field the backend validates.
  deleteRole: async (uuid: string, pin?: string): Promise<void> => {
    await apiClient.patch(`/roles/${uuid}`, {
      is_active: false,
      ...(pin ? { passcode: Number(pin) } : {}),
    });
  },

  // Requests a security-PIN ("passcode") reset email for the current user.
  requestSecurityPinReset: async (): Promise<void> => {
    await apiClient.post("/auth/forgot-passcode-email");
  },
};
