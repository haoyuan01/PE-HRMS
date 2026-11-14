"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { FormSelect } from "@/components/common/form-select";
import type { LookupItem } from "@/lib/api/lookup";

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
    <FormSelect
      label={label}
      value={filters[key]}
      onChange={(v) => setFilters((f) => ({ ...f, [key]: v }))}
      options={[
        { value: "", label: allLabel },
        ...options.map((o) => ({ value: o.uuid, label: o.name })),
      ]}
    />
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
