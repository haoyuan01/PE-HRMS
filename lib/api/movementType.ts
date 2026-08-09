import { apiClient } from "@/lib/api/client";
import type { MovementType } from "@/types/movement-type";
import type { Pagination } from "@/types/user";

export interface MovementTypeListResponse {
  success: boolean;
  data: MovementType[];
  pagination: Pagination;
}

export const movementTypeApi = {
  getMovementTypes: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    sortBy?: string;
    orderBy?: string;
  }): Promise<MovementTypeListResponse> => {
    const query: Record<string, unknown> = {
      page: params?.page ?? 1,
      size: params?.size ?? 15,
      sortBy: params?.sortBy ?? "created_at",
      orderBy: params?.orderBy ?? "desc",
    };
    if (params?.search) query["search_words[]"] = params.search;

    const response = await apiClient.get<MovementTypeListResponse>(
      "/movement-types",
      { params: query }
    );
    return response.data;
  },

  createMovementType: async (data: {
    name: string;
    description?: string | null;
  }): Promise<void> => {
    await apiClient.post("/movement-types", data);
  },

  updateMovementType: async (
    uuid: string,
    data: { name: string; description?: string | null }
  ): Promise<void> => {
    await apiClient.put(`/movement-types/${uuid}`, data);
  },

  // Soft-deletes (deactivates) a movement type via PATCH /movement-types/{uuid}.
  deleteMovementType: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/movement-types/${uuid}`, { is_active: false });
  },
};
