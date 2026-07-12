"use client";

import type { LeaveStatusSummary } from "@/types/leave-request";

interface LeaveStatusCardsProps {
  summary: LeaveStatusSummary | null;
  isLoading: boolean;
}

const CARDS: {
  key: keyof LeaveStatusSummary;
  label: string;
  valueClass: string;
}[] = [
  { key: "total", label: "Total Requests", valueClass: "text-on-surface" },
  { key: "pending", label: "Pending", valueClass: "text-amber-500" },
  { key: "approved", label: "Approved", valueClass: "text-emerald-600" },
  { key: "rejected", label: "Rejected", valueClass: "text-ds-error" },
];

export function LeaveStatusCards({ summary, isLoading }: LeaveStatusCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-2xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            {card.label}
          </p>
          {isLoading || !summary ? (
            <div className="mt-2 h-8 w-12 animate-pulse rounded bg-surface-container-high" />
          ) : (
            <p
              className={`mt-1 font-display text-3xl font-bold tracking-tight ${card.valueClass}`}
            >
              {summary[card.key]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
