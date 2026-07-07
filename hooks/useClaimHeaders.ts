"use client";

import { useEffect, useState, useCallback } from "react";
import { claimApi } from "@/lib/api/claim";
import type { ClaimHeader } from "@/types/claim";
import type { Pagination } from "@/types/user";

interface UseClaimHeadersParams {
  page?: number;
  user_uuid?: string;
  manager_approver_uuid?: string;
  is_director?: boolean;
  name?: string;
}

export function useClaimHeaders(params: UseClaimHeadersParams = {}) {
  const [claims, setClaims] = useState<ClaimHeader[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await claimApi.getClaimHeaders(params);
      setClaims(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load claims.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.user_uuid,
    params.manager_approver_uuid,
    params.is_director,
    params.name,
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { claims, pagination, isLoading, error, refetch: fetch };
}
