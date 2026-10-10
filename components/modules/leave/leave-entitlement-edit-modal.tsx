"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { leaveEntitlementApi } from "@/lib/api/leaveEntitlement";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
  LeaveEntitlementUser,
  LeaveEntitlementLog,
} from "@/types/leave-entitlement";
import type { PolicyColumn } from "@/hooks/useLeaveEntitlements";

const LABEL = "text-xs font-medium uppercase tracking-wider text-on-surface-variant";

function num(value: string | null): string {
  if (value == null || value === "") return "";
  const n = Number(value);
  return Number.isNaN(n) ? "" : String(n);
}

function formatLogDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, "dd MMM yyyy");
}

// A labelled value inside a log entry.
function LogField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs text-on-surface">{value}</p>
    </div>
  );
}

// One entry in the entitlement's history. Every field is labelled, including
// the three flags, so a "False" is as visible as a "True".
function LogEntry({ log }: { log: LeaveEntitlementLog }) {
  const trueFalse = (value: boolean) => (value ? "True" : "False");

  return (
    <div className="rounded-lg bg-surface-container-low p-3">
      <p className="truncate text-xs font-medium text-on-surface">
        Assigned {formatLogDate(log.assigned_at)}
      </p>

      <div className="mt-2 grid grid-cols-2 gap-3">
        <LogField label="Assigned Days" value={num(log.assigned_days) || "0"} />
        <LogField label="Used Days" value={num(log.used_days) || "0"} />
        <LogField label="Available At" value={formatLogDate(log.available_at)} />
        <LogField label="Expired At" value={formatLogDate(log.expired_at)} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <LogField label="Carry Forward" value={trueFalse(log.is_carry_forward)} />
        <LogField label="Prorated" value={trueFalse(log.is_prorated)} />
        <LogField label="Manual" value={trueFalse(log.is_manual)} />
      </div>
    </div>
  );
}

interface FormState {
  used_days: string;
  balance_days: string;
  carry_forward_expiry_date: string;
}

const EMPTY_FORM: FormState = {
  used_days: "",
  balance_days: "",
  carry_forward_expiry_date: "",
};

interface LeaveEntitlementEditModalProps {
  user: LeaveEntitlementUser;
  policies: PolicyColumn[];
  onClose: () => void;
  onSaved: () => void;
}

export function LeaveEntitlementEditModal({
  user,
  policies,
  onClose,
  onSaved,
}: LeaveEntitlementEditModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  // The log is internal detail — only developers see it.
  const isDev = useAuthStore((s) => s.isDev);

  // Look up the user's entitlement for a given policy uuid.
  const entByPolicy = useMemo(
    () =>
      new Map(user.leave_entitlements.map((e) => [e.leave_policy.uuid, e])),
    [user]
  );

  // Default to the first policy the user actually has an entitlement for.
  const [policyUuid, setPolicyUuid] = useState(
    () => user.leave_entitlements[0]?.leave_policy.uuid ?? policies[0]?.uuid ?? ""
  );

  const entitlement = entByPolicy.get(policyUuid);
  const logs = entitlement?.leave_entitlement_logs ?? [];
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Repopulate the fields whenever the selected policy (entitlement) changes.
  useEffect(() => {
    if (entitlement) {
      setForm({
        used_days: num(entitlement.used_days),
        balance_days: num(entitlement.balance_days),
        carry_forward_expiry_date:
          entitlement.carry_forward_expiry_date?.split("T")[0] ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyUuid]);

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entitlement) return;
    setIsSaving(true);
    try {
      await leaveEntitlementApi.updateLeaveEntitlement(entitlement.uuid, {
        used_days: Number(form.used_days) || 0,
        balance_days: Number(form.balance_days) || 0,
        ...(form.carry_forward_expiry_date
          ? { carry_forward_expiry_date: form.carry_forward_expiry_date }
          : {}),
      });
      toast.success("Leave entitlement updated successfully.");
      onSaved();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: unknown } | undefined)
            ?.message as string | undefined)
        : undefined;
      toast.error(
        typeof message === "string"
          ? message
          : "Failed to update leave entitlement. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]"
      >
        {/* Header — title with close, then the policy dropdown below it */}
        <div className="border-b border-outline-variant/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-on-surface">
              Update Leave Balance
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mt-3">
            <select
              value={policyUuid}
              onChange={(e) => setPolicyUuid(e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border-0 bg-surface-container-low pl-3 pr-9 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-ds-primary/30"
            >
              {policies.map((p) => (
                <option key={p.uuid} value={p.uuid}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {entitlement ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={LABEL}>Used Days</label>
                  <Input
                    type="number"
                    step="any"
                    value={form.used_days}
                    onChange={(e) => setField("used_days", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={LABEL}>Balance Days</label>
                  <Input
                    type="number"
                    step="any"
                    value={form.balance_days}
                    onChange={(e) => setField("balance_days", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={LABEL}>Carry Forward Expiry Date</label>
                <Input
                  type="date"
                  value={form.carry_forward_expiry_date}
                  onChange={(e) =>
                    setField("carry_forward_expiry_date", e.target.value)
                  }
                />
              </div>

              {/* Log — the entitlement's history, collapsed by default so it
                  does not push the editable fields out of view. Developers
                  only. */}
              {isDev && (
              <div className="rounded-xl bg-surface-container-low/40 p-1">
                <button
                  type="button"
                  onClick={() => setIsLogOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-container-low"
                >
                  <span className="flex items-center gap-2">
                    <span className={LABEL}>Log</span>
                    <span className="inline-flex rounded-full bg-surface-container-high px-2 py-0.5 text-[0.65rem] font-semibold text-on-surface">
                      {logs.length}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-on-surface-variant transition-transform ${
                      isLogOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isLogOpen && (
                  <div className="space-y-2 p-2 pt-1">
                    {logs.length > 0 ? (
                      logs.map((log, i) => (
                        <LogEntry key={log.uuid ?? i} log={log} />
                      ))
                    ) : (
                      <p className="py-2 text-center text-xs text-on-surface-variant">
                        No log entries for this entitlement.
                      </p>
                    )}
                  </div>
                )}
              </div>
              )}
            </>
          ) : (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              This employee has no entitlement for the selected leave policy.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-outline-variant/20 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !entitlement}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Update
          </button>
        </div>
      </form>
    </div>
  );
}
