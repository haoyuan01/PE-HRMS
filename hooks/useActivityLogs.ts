"use client";

import { useEffect, useState, useCallback } from "react";
import { activityLogApi } from "@/lib/api/activity-log";
import type { ActivityLog } from "@/types/activity-log";
import type { Pagination } from "@/types/user";

interface UseActivityLogsParams {
  page?: number;
  search?: string;
  event?: string;
}

export function useActivityLogs(params: UseActivityLogsParams = {}) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await activityLogApi.getActivityLogs(params);
      setLogs(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.search, params.event]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { logs, pagination, isLoading, error, refetch: fetch };
}
