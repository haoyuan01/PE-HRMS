"use client";

import { useEffect, useState, useCallback } from "react";
import { leavePolicyApi } from "@/lib/api/leavePolicy";
import type { LeavePolicy } from "@/types/leave-policy";
import type { Pagination } from "@/types/user";

interface UseLeavePoliciesParams {
  page?: number;
  size?: number;
  search?: string;
}

export function useLeavePolicies(params: UseLeavePoliciesParams = {}) {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await leavePolicyApi.getLeavePolicies(params);
      setPolicies(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load leave policies.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.size, params.search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { policies, pagination, isLoading, error, refetch: fetch };
}
