"use client";

import { useEffect, useState, useCallback } from "react";
import {
  announcementApi,
  type AnnouncementParams,
} from "@/lib/api/announcement";
import type { Announcement } from "@/types/announcement";
import type { Pagination } from "@/types/user";

export function useAnnouncements(params: AnnouncementParams) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { announcements, pagination } =
        await announcementApi.getAnnouncements(params);
      setAnnouncements(announcements);
      setPagination(pagination);
    } catch {
      setError("Failed to load announcements.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { announcements, pagination, isLoading, error, refetch: fetch };
}
