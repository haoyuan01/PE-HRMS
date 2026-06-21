"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import type { ActivityLog } from "@/types/activity-log";
import {
  ActionBadge,
  moduleLabel,
} from "@/components/modules/configuration/audit-log-table";
import { getFieldChanges } from "@/lib/audit-log";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const FIELD_BOX =
  "rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface";

interface AuditLogDetailModalProps {
  log: ActivityLog | null;
  onClose: () => void;
}

export function AuditLogDetailModal({ log, onClose }: AuditLogDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  if (!log) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const changes =
    log.event === "updated"
      ? getFieldChanges(log.old_values, log.new_values)
      : [];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-on-surface">
            Log Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* User */}
          <div className="space-y-2">
            <p className={FIELD_LABEL}>User</p>
            <div className={FIELD_BOX}>{log.user?.email ?? "System"}</div>
          </div>

          {/* Action + Module */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className={FIELD_LABEL}>Action</p>
              <div className={`${FIELD_BOX} flex items-center`}>
                <ActionBadge event={log.event} />
              </div>
            </div>
            <div className="space-y-2">
              <p className={FIELD_LABEL}>Module</p>
              <div className={FIELD_BOX}>{moduleLabel(log.subject_type)}</div>
            </div>
          </div>

          {/* Datetime */}
          <div className="space-y-2">
            <p className={FIELD_LABEL}>Datetime</p>
            <div className={FIELD_BOX}>
              {format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")}
            </div>
          </div>

          {/* Field Changes */}
          {changes.map((change) => (
            <div key={change.field} className="space-y-2">
              <div className="space-y-2">
                <p className={FIELD_LABEL}>Field Changed</p>
                <div className={FIELD_BOX}>{change.field}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className={FIELD_LABEL}>Old Value</p>
                  <div className={`${FIELD_BOX} break-words`}>
                    {change.oldValue}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className={FIELD_LABEL}>New Value</p>
                  <div className={`${FIELD_BOX} break-words`}>
                    {change.newValue}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-2.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
