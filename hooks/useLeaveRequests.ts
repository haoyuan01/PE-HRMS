"use client";

import { useEffect, useState, useCallback } from "react";
import { leaveRequestApi } from "@/lib/api/leaveRequest";
import type { LeaveRequest } from "@/types/leave-request";
import type { Pagination } from "@/types/user";

interface UseLeaveRequestsParams {
  page?: number;
  user_uuid?: string;
  manager_approver_uuid?: string;
  is_director?: boolean;
}

export function useLeaveRequests(params: UseLeaveRequestsParams = {}) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await leaveRequestApi.getLeaveRequests(params);
      setRequests(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load leave requests.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.user_uuid,
    params.manager_approver_uuid,
    params.is_director,
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { requests, pagination, isLoading, error, refetch: fetch };
}
