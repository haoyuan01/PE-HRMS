"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { usePermissions } from "@/hooks/usePermissions";
import { useDashboardMovements } from "@/hooks/useDashboardMovements";
import type { Movement, MovementUser } from "@/types/movement";

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : format(d, "dd MMM yyyy");
}

function Avatar({ user }: { user: MovementUser | null }) {
  const [failed, setFailed] = useState(false);
  const personal = user?.personal;
  const name = personal?.full_name ?? user?.email ?? "—";
  const image = personal?.image_path;
  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    (user?.email?.[0]?.toUpperCase() ?? "?");
  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-container-high">
      {image && !failed ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="32px"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[0.65rem] font-medium text-on-surface-variant">
          {initials}
        </span>
      )}
    </div>
  );
}

export function StaffMovementOverview() {
  const { can } = usePermissions();
  const canRead = can("movement_read");
  const { movements, isLoading } = useDashboardMovements(canRead);

  if (!canRead) return null;

  const rows = movements.slice(0, 4);

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Staff Movement
      </h2>

      <div className="rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        <div className="flex items-center justify-end border-b border-outline-variant/20 px-5 py-3">
          <Link
            href="/dashboard/staff-movement"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
          >
            View more
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-surface-container-low"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-on-surface-variant">
            No staff movements.
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
                    Movement Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    End Date
                  </th>
                  <th className="py-3 pl-4 pr-6 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {rows.map((m: Movement) => (
                  <tr key={m.uuid} className="hover:bg-surface-container-low/50">
                    <td className="py-3 pl-6 pr-4 text-sm">
                      <div className="flex items-center gap-3">
                        <Avatar user={m.user} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-on-surface">
                            {m.user?.personal?.full_name ?? m.user?.email ?? "—"}
                          </p>
                          <p className="truncate text-xs text-on-surface-variant">
                            {m.user?.employment?.department?.name ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {m.movement_type?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatDate(m.start_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatDate(m.end_date)}
                    </td>
                    <td className="py-3 pl-4 pr-6 text-sm text-on-surface-variant">
                      {m.location || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
