"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { leaveRequestApi } from "@/lib/api/leaveRequest";
import type { LeaveRequest } from "@/types/leave-request";
import type { Pagination } from "@/types/user";

interface UseLeaveRequestsParams {
  page: number;
  size: number;
  /** true = Staff List, false = My List. */
  show_all: boolean;
  /** "MM-YYYY", or null for every month. */
  month_year: string | null;
}

export function useLeaveRequests(params: UseLeaveRequestsParams) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page, size, show_all, month_year } = params;

  // Each fetch takes a number; only the latest one may update state, so a slow
  // My List response can't land on top of the Staff List (or vice versa).
  const latestRequest = useRef(0);

  const fetch = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await leaveRequestApi.getLeaveRequests({
        page,
        size,
        show_all,
        month_year,
      });
      if (requestId !== latestRequest.current) return;
      setRequests(response.data);
      setPagination(response.pagination);
    } catch {
      if (requestId !== latestRequest.current) return;
      setError("Failed to load leave requests.");
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false);
    }
  }, [page, size, show_all, month_year]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { requests, pagination, isLoading, error, refetch: fetch };
}
