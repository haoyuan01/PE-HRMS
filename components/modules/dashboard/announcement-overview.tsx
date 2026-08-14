"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { format } from "date-fns";
import { useDashboardAnnouncements } from "@/hooks/useDashboardAnnouncements";
import { AnnouncementDetailModal } from "@/components/modules/announcements/announcement-detail-modal";
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

export function AnnouncementOverview() {
  const { announcements, isLoading } = useDashboardAnnouncements();
  const [selected, setSelected] = useState<Announcement | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Announcement
      </h2>

      <div className="rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-surface-container-low"
              />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-on-surface-variant">
            <Megaphone className="h-8 w-8 opacity-40" />
            <p className="mt-2 text-sm">No announcements.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Description
                  </th>
                  <th className="py-3 pl-4 pr-6 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {announcements.map((a) => (
                  <tr
                    key={a.uuid}
                    onClick={() => setSelected(a)}
                    className="cursor-pointer transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="py-3 pl-6 pr-4 text-sm font-medium text-on-surface">
                      {a.name}
                    </td>
                    <td className="max-w-md px-4 py-3 text-sm text-on-surface-variant">
                      <span className="line-clamp-2">
                        {a.description || "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3 pl-4 pr-6 text-center text-sm text-on-surface">
                      {formatRange(a.start_date, a.end_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <AnnouncementDetailModal
          announcement={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
