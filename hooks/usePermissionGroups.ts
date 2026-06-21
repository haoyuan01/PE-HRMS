"use client";

import { useEffect, useState, useCallback } from "react";
import { permissionApi, type PermissionGroups } from "@/lib/api/permission";

export function usePermissionGroups() {
  const [groups, setGroups] = useState<PermissionGroups | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setGroups(await permissionApi.getPermissions());
    } catch {
      setError("Failed to load permissions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { groups, isLoading, error, refetch: fetch };
}
