"use client";

import { useEffect, useState, useCallback } from "react";
import { departmentApi } from "@/lib/api/department";
import type { Department } from "@/types/department";
import type { Pagination } from "@/types/user";

interface UseDepartmentsParams {
  page?: number;
  size?: number;
  search?: string;
}

export function useDepartments(params: UseDepartmentsParams = {}) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await departmentApi.getDepartments(params);
      setDepartments(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load departments.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.size, params.search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { departments, pagination, isLoading, error, refetch: fetch };
}
