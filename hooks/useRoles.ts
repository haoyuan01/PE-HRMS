"use client";

import { useEffect, useState, useCallback } from "react";
import { roleApi } from "@/lib/api/role";
import type { Role } from "@/types/auth";
import type { Pagination } from "@/types/user";

interface UseRolesParams {
  page?: number;
  per_page?: number;
  name?: string;
}

export function useRoles(params: UseRolesParams = {}) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await roleApi.getRoles(params);
      setRoles(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load permissions.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.per_page, params.name]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { roles, pagination, isLoading, error, refetch: fetch };
}
