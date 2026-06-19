"use client";

import { useEffect, useState, useCallback } from "react";
import { officeApi } from "@/lib/api/office";
import type { Office } from "@/types/office";
import type { Pagination } from "@/types/user";

interface UseOfficesParams {
  page?: number;
  size?: number;
  search?: string;
}

export function useOffices(params: UseOfficesParams = {}) {
  const [offices, setOffices] = useState<Office[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await officeApi.getOffices(params);
      setOffices(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load branches.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.size, params.search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { offices, pagination, isLoading, error, refetch: fetch };
}
