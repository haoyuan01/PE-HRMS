"use client";

import { useLeaveBalance } from "@/hooks/useLeaveBalance";

export function LeaveBalance() {
  const { entitlements, isLoading } = useLeaveBalance();

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Leave Balance
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]"
            >
              <div className="h-3 w-24 animate-pulse rounded bg-surface-container-high" />
              <div className="mt-2 h-8 w-28 animate-pulse rounded bg-surface-container-high" />
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      ) : entitlements.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant shadow-[var(--shadow-ambient)]">
          No leave entitlements found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {entitlements.slice(0, 4).map((e) => (
            <div
              key={e.uuid}
              className="rounded-2xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]"
            >
              <p className="truncate text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                {e.leave_policy.name}
              </p>
              <p className="mt-1 font-display text-3xl font-bold tracking-tight text-on-surface">
                {Number(e.balance_days)}
                <span className="text-sm font-medium text-on-surface-variant">
                  {" "}
                  / {Number(e.entitled_days)} days
                </span>
              </p>
              <p className="text-xs text-on-surface-variant">
                {Number(e.used_days)} used
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
