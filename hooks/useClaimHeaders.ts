"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { claimApi } from "@/lib/api/claim";
import type { ClaimHeader } from "@/types/claim";
import type { Pagination } from "@/types/user";

interface UseClaimHeadersParams {
  page?: number;
  /** true = Staff List, false = My List. */
  show_all: boolean;
  name?: string;
  sortBy?: string;
  orderBy?: string;
}

export function useClaimHeaders(params: UseClaimHeadersParams) {
  const [claims, setClaims] = useState<ClaimHeader[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Each fetch takes a number; only the latest one may update state, so a slow
  // My List response can't land on top of the Staff List (or vice versa).
  const latestRequest = useRef(0);

  const fetch = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await claimApi.getClaimHeaders(params);
      if (requestId !== latestRequest.current) return;
      setClaims(response.data);
      setPagination(response.pagination);
    } catch {
      if (requestId !== latestRequest.current) return;
      setError("Failed to load claims.");
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.show_all,
    params.name,
    params.sortBy,
    params.orderBy,
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { claims, pagination, isLoading, error, refetch: fetch };
}
