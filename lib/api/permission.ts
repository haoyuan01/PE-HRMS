import { apiClient } from "@/lib/api/client";

export interface PermissionOption {
  uuid: string;
  name: string;
}

// Permissions grouped by module key, e.g. { department: [{ uuid, name }, ...] }.
export type PermissionGroups = Record<string, PermissionOption[]>;

interface PermissionLookupResponse {
  success: boolean;
  message: string;
  data: PermissionGroups;
}

export const permissionApi = {
  getPermissions: async (): Promise<PermissionGroups> => {
    const response = await apiClient.get<PermissionLookupResponse>(
      "/lookup/permissions"
    );
    return response.data.data;
  },
};
