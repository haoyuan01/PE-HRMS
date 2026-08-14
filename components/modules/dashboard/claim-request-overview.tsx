"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardClaims } from "@/hooks/useDashboardClaims";
import type { ClaimHeader } from "@/types/claim";

function claimStatus(claim: ClaimHeader) {
  if (claim.director_reviewed_by)
    return { label: "Reviewed", className: "bg-sky-500/10 text-sky-600" };
  return { label: "Pending", className: "bg-amber-500/10 text-amber-600" };
}

function money(value: string) {
  const n = Number(value);
  return `RM ${Number.isNaN(n) ? value : n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function MiniClaimTable({
  title,
  claims,
  isLoading,
  primaryLabel,
  primary,
  viewMoreHref,
  statusAlign = "right",
}: {
  title: string;
  claims: ClaimHeader[];
  isLoading: boolean;
  primaryLabel: string;
  primary: (c: ClaimHeader) => string;
  viewMoreHref: string;
  statusAlign?: "left" | "right";
}) {
  const rows = claims.slice(0, 4);
  const statusAlignClass = statusAlign === "left" ? "text-left" : "text-right";
  return (
    <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
      <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-3">
        <h3 className="font-display text-sm font-semibold text-on-surface">
          {title}
        </h3>
        <Link
          href={viewMoreHref}
          className="inline-flex items-center gap-0.5 text-xs font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
        >
          View more
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-surface-container-low"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-on-surface-variant">
          No claim requests.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="py-2.5 pl-5 pr-4 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                  {primaryLabel}
                </th>
                <th className="px-4 py-2.5 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Amount
                </th>
                <th className={`py-2.5 pl-4 pr-5 text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant ${statusAlignClass}`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {rows.map((c) => {
                const status = claimStatus(c);
                return (
                  <tr key={c.uuid} className="hover:bg-surface-container-low/50">
                    <td className="py-2.5 pl-5 pr-4 text-sm font-medium text-on-surface">
                      <span className="line-clamp-1">{primary(c)}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm text-on-surface-variant">
                      {money(c.total_amount)}
                    </td>
                    <td className={`py-2.5 pl-4 pr-5 ${statusAlignClass}`}>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ClaimRequestOverview() {
  const canViewRecent = useAuthStore((s) => s.isAccountant || s.isDirector);
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);

  const my = useDashboardClaims(true);
  const recent = useDashboardClaims(false, canViewRecent);

  // The current user's own claims live under "My Claim Request", so keep them
  // out of the recent (staff) list.
  const recentClaims = recent.claims.filter(
    (c) => c.user?.uuid !== currentUserUuid
  );

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Claim Expenses
      </h2>

      <div
        className={`grid grid-cols-1 gap-4 ${
          canViewRecent ? "lg:grid-cols-2" : ""
        }`}
      >
        {canViewRecent && (
          <MiniClaimTable
            title="Recent Claim Request"
            claims={recentClaims}
            isLoading={recent.isLoading}
            primaryLabel="Name"
            primary={(c) => c.user?.personal?.full_name ?? c.user?.email ?? "—"}
            viewMoreHref="/dashboard/requests/expenses?tab=staff"
            statusAlign="left"
          />
        )}
        <MiniClaimTable
          title="My Claim Request"
          claims={my.claims}
          isLoading={my.isLoading}
          primaryLabel="Claim"
          primary={(c) => c.name}
          viewMoreHref="/dashboard/requests/expenses?tab=my"
        />
      </div>
    </div>
  );
}
