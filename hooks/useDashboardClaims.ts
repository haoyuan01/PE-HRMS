"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard";
import type { ClaimHeader } from "@/types/claim";

export function useDashboardClaims(relevantToMe: boolean, enabled = true) {
  const [claims, setClaims] = useState<ClaimHeader[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setIsLoading(true);
    dashboardApi
      .getClaimHeaders(relevantToMe)
      .then((data) => active && setClaims(data))
      .catch(() => active && setClaims([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [relevantToMe, enabled]);

  return { claims, isLoading };
}
