"use client";

import { useEffect, useState, useCallback } from "react";
import {
  upcomingEventApi,
  type UpcomingEventParams,
} from "@/lib/api/upcomingEvent";
import type { UpcomingEvent } from "@/types/event";
import type { Pagination } from "@/types/user";

export function useUpcomingEvents(params: UpcomingEventParams) {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { events, pagination } = await upcomingEventApi.getUpcomingEvents(
        params
      );
      setEvents(events);
      setPagination(pagination);
    } catch {
      setError("Failed to load upcoming events.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { events, pagination, isLoading, error, refetch: fetch };
}
