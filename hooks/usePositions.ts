"use client";

import { useEffect, useState, useCallback } from "react";
import { positionApi } from "@/lib/api/position";
import type { Position } from "@/types/position";
import type { Pagination } from "@/types/user";

interface UsePositionsParams {
  page?: number;
  per_page?: number;
  name?: string;
}

export function usePositions(params: UsePositionsParams = {}) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await positionApi.getPositions(params);
      setPositions(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load positions.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.per_page, params.name]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { positions, pagination, isLoading, error, refetch: fetch };
}
