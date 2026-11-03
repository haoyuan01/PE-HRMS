"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard";
import type { ClaimHeader } from "@/types/claim";

/** showAll: true = staff ("Recent"), false = the current user's ("My"). */
export function useDashboardClaims(showAll: boolean, enabled = true) {
  const [claims, setClaims] = useState<ClaimHeader[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    dashboardApi
      .getClaimHeaders(showAll)
      .then((data) => active && setClaims(data))
      .catch(() => active && setClaims([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [showAll, enabled]);

  return { claims, isLoading };
}
