"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { format } from "date-fns";
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

interface MovementDayModalProps {
  date: string;
  movements: Movement[];
  onClose: () => void;
}

export function MovementDayModal({
  date,
  movements,
  onClose,
}: MovementDayModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">
              Staff Movement
            </h2>
            <p className="text-xs text-on-surface-variant">
              {formatDate(date)} · {movements.length}{" "}
              {movements.length === 1 ? "movement" : "movements"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-on-surface-variant">
              <p className="text-sm">No movements on this day.</p>
            </div>
          ) : (
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
                    Start
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    End
                  </th>
                  <th className="py-3 pl-4 pr-6 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {movements.map((m) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
