"use client";

import { useMemo, useState } from "react";
import { Download, Wallet } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePayrollUsers } from "@/hooks/usePayrollUsers";
import { PayslipPinModal } from "@/components/modules/payslip/payslip-pin-modal";
import type { PayrollItem } from "@/types/payroll";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isPublished(payroll: PayrollItem) {
  return payroll.is_published !== false;
}

function periodOf(p: PayrollItem) {
  const m = p.month ? MONTHS[Number(p.month) - 1] ?? p.month : "";
  return `${m} ${p.year ?? ""}`.trim() || "—";
}

export function PayrollMyList() {
  const userUuid = useAuthStore((s) => s.user?.uuid);

  // Same /payrolls endpoint, scoped to the current user via user_uuid.
  const { users, isLoading, error, refetch } = usePayrollUsers({
    user_uuid: userUuid,
  });

  // The attachment to open once the PIN is verified.
  const [pinUrl, setPinUrl] = useState<string | null>(null);

  const payrolls = useMemo(() => {
    const me = users.find((u) => u.uuid === userUuid) ?? users[0];
    // Employees only see published payslips; unpublished ones stay in Staff List.
    return (me?.payrolls ?? [])
      .filter(isPublished)
      .sort(
        (a, b) =>
          Number(b.year ?? 0) - Number(a.year ?? 0) ||
          Number(b.month ?? 0) - Number(a.month ?? 0)
      );
  }, [users, userUuid]);

  return (
    <div className="rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
      {error ? (
        <div className="p-8">
          <p className="text-sm text-ds-error">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg bg-surface-container-low"
            />
          ))}
        </div>
      ) : payrolls.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-on-surface-variant">
          <Wallet className="h-8 w-8 opacity-40" />
          <p className="text-sm">No payslips available yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Payslip
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Status
                </th>
                <th className="py-3 pl-4 pr-6 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Remark
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {payrolls.map((p) => (
                <tr
                  key={p.uuid}
                  className="transition-colors hover:bg-surface-container-low/50"
                >
                  <td className="py-3 pl-6 pr-4 text-sm font-medium text-on-surface">
                    {periodOf(p)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {p.attachment_path ? (
                      <button
                        onClick={() => setPinUrl(p.attachment_path ?? null)}
                        className="inline-flex items-center gap-1.5 font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
                      >
                        <Download className="h-4 w-4" />
                        View
                      </button>
                    ) : (
                      <span className="text-on-surface-variant">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        isPublished(p)
                          ? "text-green-600 dark:text-green-400"
                          : "text-on-surface-variant"
                      }
                    >
                      {isPublished(p) ? "Published" : "Not Published"}
                    </span>
                  </td>
                  <td className="py-3 pl-4 pr-6 text-center text-sm text-on-surface-variant">
                    {p.remark || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pinUrl && (
        <PayslipPinModal
          onClose={() => setPinUrl(null)}
          onVerified={() => {
            window.open(pinUrl, "_blank", "noopener,noreferrer");
            setPinUrl(null);
          }}
        />
      )}
    </div>
  );
}
