"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, CalendarDays, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { Announcement } from "@/types/announcement";

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

interface AnnouncementDetailModalProps {
  announcement: Announcement;
  onClose: () => void;
}

export function AnnouncementDetailModal({
  announcement,
  onClose,
}: AnnouncementDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const images = announcement.images ?? [];
  const mainImage = images[active]?.image_path;
  const go = (next: number) =>
    setActive((images.length ? (next + images.length) % images.length : 0));

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
              alt={announcement.name}
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

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(active - 1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                {images.map((img, i) => (
                  <span
                    key={img.uuid}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active ? "w-5 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
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
            {announcement.name}
          </h2>

          <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
            <CalendarDays className="h-4 w-4" />
            {formatRange(announcement.start_date, announcement.end_date)}
          </div>

          {announcement.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
              {announcement.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
