"use client";

import { useEffect, useState, useCallback } from "react";
import { overtimeApi } from "@/lib/api/overtime";
import type { Overtime } from "@/types/overtime";
import type { Pagination } from "@/types/user";

export function useOvertimes(params: { page?: number } = {}) {
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await overtimeApi.getOvertimes(params);
      setOvertimes(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load overtime requests.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { overtimes, pagination, isLoading, error, refetch: fetch };
}
