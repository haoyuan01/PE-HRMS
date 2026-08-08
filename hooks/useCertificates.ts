"use client";

import { useEffect, useState, useCallback } from "react";
import { certificateApi } from "@/lib/api/certificate";
import type { UserCertificate } from "@/types/certificate";

export function useCertificates(userUuid?: string) {
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userUuid) return;
    setIsLoading(true);
    setError(null);
    try {
      setCertificates(await certificateApi.getCertificates(userUuid));
    } catch {
      setError("Failed to load certificates.");
    } finally {
      setIsLoading(false);
    }
  }, [userUuid]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { certificates, isLoading, error, refetch: fetch };
}
