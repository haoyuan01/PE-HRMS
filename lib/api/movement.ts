import { apiClient } from "@/lib/api/client";
import type {
  Movement,
  MovementCalendarResponse,
  MovementListResponse,
  MovementPagination,
} from "@/types/movement";

export interface MovementParams {
  page?: number;
  size?: number;
  user_name?: string;
  movement_type_uuid?: string;
  department?: string;
  position?: string;
  office?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
}

export const movementApi = {
  getMovements: async (
    params?: MovementParams
  ): Promise<{ movements: Movement[]; pagination: MovementPagination | null }> => {
    const response = await apiClient.get<MovementListResponse>("/movements", {
      params,
    });
    return {
      movements: response.data.data ?? [],
      pagination: response.data.pagination ?? null,
    };
  },

  // NOTE: payload field names are assumed (mirroring the list filter params) —
  // confirm against the real create-movement API.
  createMovement: async (data: {
    user_uuid: string;
    movement_type_uuid: string;
    start_date: string;
    end_date?: string | null;
    location?: string | null;
    description?: string | null;
  }): Promise<void> => {
    await apiClient.post("/movements", data);
  },

  // NOTE: endpoint/payload assumed (follows the system's PUT-to-update pattern).
  updateMovement: async (
    uuid: string,
    data: {
      user_uuid: string;
      movement_type_uuid: string;
      start_date: string;
      end_date?: string | null;
      location?: string | null;
      remark?: string | null;
    }
  ): Promise<void> => {
    await apiClient.put(`/movements/${uuid}`, data);
  },

  // Soft-delete — deactivates the movement (follows the is_active convention).
  deleteMovement: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/movements/${uuid}`, { is_active: false });
  },

  getCalendarSummaries: async (
    startDate: string,
    endDate: string
  ): Promise<Record<string, Movement[]>> => {
    const response = await apiClient.get<MovementCalendarResponse>(
      "/movements/calendar-summaries",
      { params: { start_date: startDate, end_date: endDate } }
    );
    const data = response.data.data;
    // The API returns movements grouped by date (or an empty array when there's
    // nothing in range).
    if (Array.isArray(data)) return {};
    const map: Record<string, Movement[]> = {};
    for (const [date, movements] of Object.entries(data)) {
      map[date] = Array.isArray(movements) ? movements : [];
    }
    return map;
  },
};
