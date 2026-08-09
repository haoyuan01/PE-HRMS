"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { PayrollStaffList } from "@/components/modules/payslip/payroll-staff-list";
import { PayrollMyList } from "@/components/modules/payslip/payroll-my-list";

type Tab = "my" | "staff";

export default function PayslipPage() {
  // Accountants and directors get the Staff List (everyone's payslips); every
  // other user only sees their own (My List).
  const canViewStaff = useAuthStore((s) => s.isAccountant || s.isDirector);

  const [tab, setTab] = useState<Tab>("my");
  const effectiveTab: Tab = canViewStaff ? tab : "my";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Payslip
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          View and download your payslips.
        </p>
      </div>

      {/* Tabs (accountants/directors only) */}
      {canViewStaff && (
        <div className="flex w-fit items-center gap-1 rounded-lg bg-surface-container-low p-1">
          {(["my", "staff"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t === "my" ? "My List" : "Staff List"}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {effectiveTab === "staff" ? <PayrollStaffList /> : <PayrollMyList />}
    </div>
  );
}
