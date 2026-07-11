"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { X, FileText } from "lucide-react";
import type { CalendarLeaveRequest } from "@/types/leave-request";

const FIELD_LABEL = "text-xs uppercase tracking-wider text-on-surface-variant";
const FIELD_BOX =
  "mt-1 rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface";

function formatDate(value: string | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
}

// Approval state derived from the manager/director action flags.
function requestStatus(r: CalendarLeaveRequest) {
  const rejected =
    (r.manager_action_at && !r.manager_approved) ||
    (r.director_action_at && !r.director_approved);
  if (rejected)
    return { label: "Rejected", className: "bg-ds-error/10 text-ds-error" };
  if (r.manager_approved && r.director_approved)
    return { label: "Approved", className: "bg-emerald-500/10 text-emerald-600" };
  return { label: "Pending", className: "bg-amber-500/10 text-amber-600" };
}

function Avatar({ user }: { user: CalendarLeaveRequest["user"] }) {
  const [imageFailed, setImageFailed] = useState(false);
  const personal = user.personal;
  const name = personal?.full_name ?? user.email;
  const image = personal?.image_path;
  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    (user.email[0]?.toUpperCase() ?? "?");

  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-container-high">
      {image && !imageFailed ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="36px"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-on-surface-variant">
          {initials}
        </span>
      )}
    </div>
  );
}

interface LeaveDayModalProps {
  date: string; // "yyyy-MM-dd"
  requests: CalendarLeaveRequest[];
  onClose: () => void;
}

export function LeaveDayModal({ date, requests, onClose }: LeaveDayModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">
              On Leave
            </h2>
            <p className="text-xs text-on-surface-variant">
              {format(new Date(date), "EEEE, dd MMMM yyyy")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {requests.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              No leave requests for this day.
            </p>
          ) : (
            requests.map((r) => {
              const status = requestStatus(r);
              const policy = r.leave_entitlement?.leave_policy;
              return (
                <div
                  key={r.uuid}
                  className="rounded-xl border border-outline-variant/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={r.user} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-on-surface">
                          {r.user.personal?.full_name ?? r.user.email}
                        </p>
                        {policy && (
                          <p className="text-xs text-on-surface-variant">
                            {policy.code} · {policy.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div>
                      <p className={FIELD_LABEL}>Total Days</p>
                      <div className={FIELD_BOX}>
                        {Number(r.total_days)}
                        {r.is_half_day ? " (Half Day)" : ""}
                      </div>
                    </div>
                    <div>
                      <p className={FIELD_LABEL}>Duration</p>
                      <div className={FIELD_BOX}>
                        {formatDate(r.start_date)} – {formatDate(r.end_date)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className={FIELD_LABEL}>Reason</p>
                    <div className={`${FIELD_BOX} ${r.reason ? "" : "text-on-surface-variant"}`}>
                      {r.reason || "—"}
                    </div>
                  </div>

                  {r.attachment_url && (
                    <div className="mt-3">
                      <p className={FIELD_LABEL}>Attachment</p>
                      <a
                        href={r.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm text-ds-primary transition-colors hover:border-ds-primary/40"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">View attachment</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
