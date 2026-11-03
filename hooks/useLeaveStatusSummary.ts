"use client";

import { useEffect, useState } from "react";
import { leaveRequestApi } from "@/lib/api/leaveRequest";
import type { LeaveStatusSummary } from "@/types/leave-request";

interface UseLeaveStatusSummaryParams {
  /** true = Staff List, false = My List. */
  show_all: boolean;
  /** "MM-YYYY", or null for every month. */
  month_year: string | null;
  /** false skips the request (e.g. the cards are hidden). */
  enabled?: boolean;
}

interface LoadedSummary {
  key: string;
  summary: LeaveStatusSummary | null;
}

/** Totals for the status cards; refetches when the tab or month changes. */
export function useLeaveStatusSummary({
  show_all,
  month_year,
  enabled = true,
}: UseLeaveStatusSummaryParams) {
  const key = `${show_all ? 1 : 0}|${month_year ?? ""}`;
  const [loaded, setLoaded] = useState<LoadedSummary | null>(null);

  useEffect(() => {
    if (!enabled) return;
    // Ignore a slow response that arrives after the tab or month changed.
    let cancelled = false;
    const load = async () => {
      let summary: LeaveStatusSummary | null = null;
      try {
        summary = await leaveRequestApi.getStatusSummaries({
          show_all,
          month_year,
        });
      } catch {
        summary = null;
      }
      if (!cancelled) setLoaded({ key, summary });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, key, show_all, month_year]);

  // Loading until the response for the current tab and month has arrived.
  const isLoading = loaded?.key !== key;
  return { summary: isLoading ? null : loaded.summary, isLoading };
}
