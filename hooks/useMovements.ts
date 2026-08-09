"use client";

import { useEffect, useState, useCallback } from "react";
import { movementApi, type MovementParams } from "@/lib/api/movement";
import type { Movement, MovementPagination } from "@/types/movement";

export function useMovements(params: MovementParams) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [pagination, setPagination] = useState<MovementPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { movements, pagination } = await movementApi.getMovements(params);
      setMovements(movements);
      setPagination(pagination);
    } catch {
      setError("Failed to load staff movements.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { movements, pagination, isLoading, error, refetch: fetch };
}
