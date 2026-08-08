"use client";

import { useEffect, useState, useCallback } from "react";
import { certificateApi } from "@/lib/api/certificate";
import type { CertificateUser } from "@/types/certificate";

export function useCertificateUsers() {
  const [users, setUsers] = useState<CertificateUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(await certificateApi.getCertificateUsers());
    } catch {
      setError("Failed to load certificates.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { users, isLoading, error, refetch: fetch };
}
