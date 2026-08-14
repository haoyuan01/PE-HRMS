"use client";

import { useEffect, useState } from "react";
import { dashboardApi, type DashboardSummary } from "@/lib/api/dashboard";

export function useDashboardSummaries() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dashboardApi
      .getSummaries()
      .then((data) => active && setSummary(data))
      .catch(() => active && setSummary(null))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { summary, isLoading };
}
