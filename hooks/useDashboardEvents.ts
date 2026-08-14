"use client";

import { useEffect, useState } from "react";
import { upcomingEventApi } from "@/lib/api/upcomingEvent";
import type { UpcomingEvent } from "@/types/event";

export function useDashboardEvents(relevantToMe = true) {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    upcomingEventApi
      .getDashboardUpcomingEvents(relevantToMe)
      .then((data) => active && setEvents(data))
      .catch(() => active && setEvents([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [relevantToMe]);

  return { events, isLoading };
}
