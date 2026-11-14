"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { FormSelect } from "@/components/common/form-select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface PayslipFilters {
  month: number;
  year: number;
  department: string;
  branch: string;
  status: "all" | "published" | "not";
}

interface PayslipFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: PayslipFilters) => void;
  initialFilters: PayslipFilters;
  years: number[];
  departments: string[];
  branches: string[];
}

export function PayslipFilterModal({
  open,
  onClose,
  onApply,
  initialFilters,
  years,
  departments,
  branches,
}: PayslipFilterModalProps) {
  const [filters, setFilters] = useState<PayslipFilters>(initialFilters);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setFilters(initialFilters);
  }, [open, initialFilters]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-on-surface">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Fields */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Month"
              value={String(filters.month)}
              onChange={(v) => setFilters((f) => ({ ...f, month: Number(v) }))}
              options={[
                { value: "0", label: "All" },
                ...MONTHS.map((m, i) => ({ value: String(i + 1), label: m })),
              ]}
            />
            <FormSelect
              label="Year"
              value={String(filters.year)}
              onChange={(v) => setFilters((f) => ({ ...f, year: Number(v) }))}
              options={[
                { value: "0", label: "All" },
                ...years.map((y) => ({ value: String(y), label: String(y) })),
              ]}
            />
          </div>

          <FormSelect
            label="Department"
            value={filters.department}
            onChange={(v) => setFilters((f) => ({ ...f, department: v }))}
            options={[
              { value: "all", label: "All Departments" },
              ...departments.map((d) => ({ value: d, label: d })),
            ]}
          />

          <FormSelect
            label="Branch"
            value={filters.branch}
            onChange={(v) => setFilters((f) => ({ ...f, branch: v }))}
            options={[
              { value: "all", label: "All Branches" },
              ...branches.map((b) => ({ value: b, label: b })),
            ]}
          />

          <FormSelect
            label="Status"
            value={filters.status}
            onChange={(v) =>
              setFilters((f) => ({ ...f, status: v as PayslipFilters["status"] }))
            }
            options={[
              { value: "all", label: "All Status" },
              { value: "published", label: "Published" },
              { value: "not", label: "Not Published" },
            ]}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(filters)}
            className="rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
