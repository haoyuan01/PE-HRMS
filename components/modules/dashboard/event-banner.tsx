"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { useDashboardEvents } from "@/hooks/useDashboardEvents";
import { EventDetailModal } from "@/components/modules/events/event-detail-modal";
import type { UpcomingEvent } from "@/types/event";

const AUTO_MS = 5000;

function formatRange(start: string | null, end: string | null) {
  if (!start) return "";
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return start;
  const e = end ? new Date(end) : null;
  if (!e || Number.isNaN(e.getTime()) || start === end) {
    return format(s, "dd MMM yyyy");
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  return `${format(s, sameYear ? "dd MMM" : "dd MMM yyyy")} – ${format(e, "dd MMM yyyy")}`;
}

export function EventBanner() {
  const { events, isLoading } = useDashboardEvents(true);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<UpcomingEvent | null>(null);

  const count = events.length;
  const go = useCallback(
    (next: number) => setIndex((count ? (next + count) % count : 0)),
    [count]
  );

  // Keep the index valid if the slide count changes.
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  // Auto-advance.
  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_MS);
    return () => clearInterval(t);
  }, [count]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-on-surface">
          Upcoming Events
        </h2>
        <div className="h-56 w-full animate-pulse rounded-2xl bg-surface-container-low sm:h-72" />
      </div>
    );
  }

  if (count === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Upcoming Events
      </h2>
    <div className="group relative h-56 w-full overflow-hidden rounded-2xl bg-surface-container-high shadow-[var(--shadow-ambient)] sm:h-72">
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {events.map((event) => {
          const image = event.images?.[0]?.image_path;
          return (
            <div
              key={event.uuid}
              onClick={() => setSelected(event)}
              className="relative h-full w-full shrink-0 cursor-pointer"
            >
              {image ? (
                <Image
                  src={image}
                  alt={event.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-ds-primary/30 to-ds-primary-dim/30" />
              )}
              {/* Gradient + text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold text-white sm:text-2xl">
                  {event.name}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/85 sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {formatRange(event.start_date, event.end_date)}
                  </span>
                  {event.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls (only when more than one) */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 right-5 flex items-center gap-1.5">
            {events.map((event, i) => (
              <button
                key={event.uuid}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>

    {selected && (
      <EventDetailModal event={selected} onClose={() => setSelected(null)} />
    )}
    </div>
  );
}
