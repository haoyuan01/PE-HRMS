import { apiClient } from "@/lib/api/client";
import type {
  CalendarDaySummary,
  CalendarSummaryResponse,
} from "@/types/leave-request";

export const leaveRequestApi = {
  // Per-day leave summaries for the given (inclusive) date range, e.g. a month.
  getCalendarSummaries: async (
    startDate: string,
    endDate: string
  ): Promise<Record<string, CalendarDaySummary>> => {
    const response = await apiClient.get<CalendarSummaryResponse>(
      "/leave-requests/calendar-summaries",
      { params: { start_date: startDate, end_date: endDate } }
    );
    return response.data.data;
  },
};
