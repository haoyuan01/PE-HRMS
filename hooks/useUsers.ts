"use client";

import { useEffect, useState, useCallback } from "react";
import { userApi } from "@/lib/api/user";
import type { UserProfile, Pagination } from "@/types/user";

interface UseUsersParams {
  page?: number;
  per_page?: number;
  name?: string;
  department?: string;
  position?: string;
}

export function useUsers(params: UseUsersParams = {}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.getUsers(params);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.per_page, params.name, params.department, params.position]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { users, pagination, isLoading, error, refetch: fetch };
}
