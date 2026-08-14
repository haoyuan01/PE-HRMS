"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard";
import type { Announcement } from "@/types/announcement";

export function useDashboardAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dashboardApi
      .getAnnouncements()
      .then((data) => active && setAnnouncements(data))
      .catch(() => active && setAnnouncements([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { announcements, isLoading };
}
