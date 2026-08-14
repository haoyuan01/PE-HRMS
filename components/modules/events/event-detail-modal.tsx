"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, MapPin, CalendarDays, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import type { UpcomingEvent } from "@/types/event";

function formatRange(start: string | null, end: string | null) {
  if (!start) return "—";
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return start;
  const e = end ? new Date(end) : null;
  if (!e || Number.isNaN(e.getTime()) || start === end) {
    return format(s, "dd MMM yyyy");
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  return `${format(s, sameYear ? "dd MMM" : "dd MMM yyyy")} – ${format(e, "dd MMM yyyy")}`;
}

interface EventDetailModalProps {
  event: UpcomingEvent;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const images = event.images ?? [];
  const mainImage = images[active]?.image_path;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {/* Image header */}
        <div className="relative h-56 w-full shrink-0 bg-surface-container-high sm:h-64">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={event.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 672px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-on-surface-variant/40">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.uuid}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    i === active
                      ? "border-ds-primary"
                      : "border-transparent hover:border-outline-variant/40"
                  }`}
                >
                  {img.image_path && (
                    <Image
                      src={img.image_path}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          <h2 className="font-display text-xl font-bold text-on-surface">
            {event.name}
          </h2>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-on-surface-variant">
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

          {event.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
