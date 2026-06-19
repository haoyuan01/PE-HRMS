import { apiClient } from "@/lib/api/client";
import type { Position } from "@/types/position";
import type { Pagination } from "@/types/user";

export interface PositionListResponse {
  success: boolean;
  data: Position[];
  pagination: Pagination;
}

export const positionApi = {
  getPositions: async (params?: {
    page?: number;
    per_page?: number;
    name?: string;
  }): Promise<PositionListResponse> => {
    const response = await apiClient.get<PositionListResponse>("/positions", {
      params,
    });
    return response.data;
  },

  createPosition: async (data: {
    name: string;
    description?: string;
  }): Promise<void> => {
    await apiClient.post("/positions", data);
  },

  updatePosition: async (
    uuid: string,
    data: { name: string; description?: string }
  ): Promise<void> => {
    await apiClient.put(`/positions/${uuid}`, data);
  },

  // Soft-deletes (deactivates) a position via PATCH /positions/{uuid}.
  deletePosition: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/positions/${uuid}`, { is_active: false });
  },
};
