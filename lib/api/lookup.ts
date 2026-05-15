import { apiClient } from "@/lib/api/client";

export interface LookupItem {
  uuid: string;
  name: string;
}

interface LookupResponse {
  success: boolean;
  message: string;
  data: LookupItem[];
}

export const lookupApi = {
  getDepartments: async (): Promise<LookupItem[]> => {
    const response = await apiClient.get<LookupResponse>("/lookup/departments");
    return response.data.data;
  },

  getOffices: async (): Promise<LookupItem[]> => {
    const response = await apiClient.get<LookupResponse>("/lookup/offices");
    return response.data.data;
  },

  getPositions: async (): Promise<LookupItem[]> => {
    const response = await apiClient.get<LookupResponse>("/lookup/positions");
    return response.data.data;
  },
};
