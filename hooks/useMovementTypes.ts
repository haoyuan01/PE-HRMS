"use client";

import { useEffect, useState, useCallback } from "react";
import { movementTypeApi } from "@/lib/api/movementType";
import type { MovementType } from "@/types/movement-type";
import type { Pagination } from "@/types/user";

interface UseMovementTypesParams {
  page?: number;
  size?: number;
  search?: string;
}

export function useMovementTypes(params: UseMovementTypesParams = {}) {
  const [movementTypes, setMovementTypes] = useState<MovementType[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await movementTypeApi.getMovementTypes(params);
      setMovementTypes(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load movement types.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.size, params.search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { movementTypes, pagination, isLoading, error, refetch: fetch };
}
