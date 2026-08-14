"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard";
import type { LeaveRequest } from "@/types/leave-request";

export function useDashboardLeaveRequests(relevantToMe: boolean, enabled = true) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setIsLoading(true);
    dashboardApi
      .getLeaveRequests(relevantToMe)
      .then((data) => active && setRequests(data))
      .catch(() => active && setRequests([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [relevantToMe, enabled]);

  return { requests, isLoading };
}
