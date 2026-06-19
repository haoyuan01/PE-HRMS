import { apiClient } from "@/lib/api/client";
import type { Office } from "@/types/office";
import type { Pagination } from "@/types/user";

export interface OfficeListResponse {
  success: boolean;
  data: Office[];
  pagination: Pagination;
}

export interface OfficeResponse {
  success: boolean;
  message: string;
  data: Office;
}

export interface OfficePayload {
  name: string;
  description?: string;
  address_1?: string;
  address_2?: string;
  address_3?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone_number?: string;
  fax_number?: string;
  email?: string;
}

export const officeApi = {
  getOffices: async (params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<OfficeListResponse> => {
    const query: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 15,
    };
    if (params?.search) query["search_words[]"] = params.search;

    const response = await apiClient.get<OfficeListResponse>("/offices", {
      params: query,
    });
    return response.data;
  },

  getOffice: async (uuid: string): Promise<Office> => {
    const response = await apiClient.get<OfficeResponse>(`/offices/${uuid}`);
    return response.data.data;
  },

  createOffice: async (data: OfficePayload): Promise<void> => {
    await apiClient.post("/offices", data);
  },

  updateOffice: async (uuid: string, data: OfficePayload): Promise<void> => {
    await apiClient.put(`/offices/${uuid}`, data);
  },

  // Soft-deletes (deactivates) a branch office via PATCH /offices/{uuid}.
  deleteOffice: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/offices/${uuid}`, { is_active: false });
  },
};
