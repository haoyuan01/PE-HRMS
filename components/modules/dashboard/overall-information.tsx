"use client";

import { CalendarClock, Receipt, Users, CalendarCheck } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardSummaries } from "@/hooks/useDashboardSummaries";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone: string;
  caption?: React.ReactNode;
}

function StatCard({ label, value, icon, tone, caption }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            {label}
          </p>
          {caption && (
            <p className="text-[0.7rem] text-on-surface-variant">{caption}</p>
          )}
          <p className="mt-0.5 font-display text-xl font-bold text-on-surface">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function OverallInformation() {
  // Only managers and directors see the overall information.
  const canView = useAuthStore((s) => s.isManager || s.isDirector);
  const { summary, isLoading } = useDashboardSummaries();

  if (!canView) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Overall Information
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-surface-container-low"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Pending Leave"
            value={summary?.pending_leave ?? 0}
            icon={<CalendarClock className="h-5 w-5 text-amber-600" />}
            tone="bg-amber-500/10"
          />
          <StatCard
            label="Pending Claim"
            value={summary?.pending_claim ?? 0}
            icon={<Receipt className="h-5 w-5 text-blue-600" />}
            tone="bg-blue-500/10"
          />
          <StatCard
            label="Total Users"
            value={summary?.total_users ?? 0}
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            tone="bg-emerald-500/10"
          />
          <StatCard
            label="Leave Applied"
            value={summary?.leave_applied ?? 0}
            icon={<CalendarCheck className="h-5 w-5 text-ds-primary" />}
            tone="bg-ds-primary/10"
          />
        </div>
      )}
    </div>
  );
}
