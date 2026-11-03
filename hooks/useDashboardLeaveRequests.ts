"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard";
import type { LeaveRequest } from "@/types/leave-request";

/** showAll: true = staff ("Recent"), false = the current user's ("My"). */
export function useDashboardLeaveRequests(showAll: boolean, enabled = true) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    dashboardApi
      .getLeaveRequests(showAll)
      .then((data) => active && setRequests(data))
      .catch(() => active && setRequests([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [showAll, enabled]);

  return { requests, isLoading };
}
