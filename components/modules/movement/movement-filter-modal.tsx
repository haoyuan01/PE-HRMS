"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { LookupItem } from "@/lib/api/lookup";

const FIELD =
  "w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

export interface MovementFilters {
  movement_type: string;
  department: string;
  position: string;
  office: string;
}

interface MovementFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: MovementFilters) => void;
  initialFilters: MovementFilters;
  movementTypes: LookupItem[];
  departments: LookupItem[];
  positions: LookupItem[];
  offices: LookupItem[];
}

export function MovementFilterModal({
  open,
  onClose,
  onApply,
  initialFilters,
  movementTypes,
  departments,
  positions,
  offices,
}: MovementFilterModalProps) {
  const [filters, setFilters] = useState<MovementFilters>(initialFilters);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setFilters(initialFilters);
  }, [open, initialFilters]);

  if (!open) return null;

  const field = (
    label: string,
    key: keyof MovementFilters,
    options: LookupItem[],
    allLabel: string
  ) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-on-surface-variant">
        {label}
      </label>
      <select
        value={filters[key]}
        onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
        className={FIELD}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.uuid} value={o.uuid}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );

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
          {field("Movement Type", "movement_type", movementTypes, "All Types")}
          {field("Department", "department", departments, "All Departments")}
          {field("Position", "position", positions, "All Positions")}
          {field("Branch Office", "office", offices, "All Branches")}
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
