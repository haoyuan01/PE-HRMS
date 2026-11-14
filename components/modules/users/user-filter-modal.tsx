"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import { FormSelect } from "@/components/common/form-select";

export interface UserFilters {
  department: string;
  position: string;
}

interface UserFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: UserFilters) => void;
  initialFilters: UserFilters;
}

export function UserFilterModal({
  open,
  onClose,
  onApply,
  initialFilters,
}: UserFilterModalProps) {
  const [department, setDepartment] = useState(initialFilters.department);
  const [position, setPosition] = useState(initialFilters.position);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [positions, setPositions] = useState<LookupItem[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync local state when modal opens with new initial filters
  useEffect(() => {
    if (open) {
      setDepartment(initialFilters.department);
      setPosition(initialFilters.position);
    }
  }, [open, initialFilters.department, initialFilters.position]);

  // Fetch lookup data
  useEffect(() => {
    lookupApi.getDepartments().then(setDepartments).catch(() => {});
    lookupApi.getPositions().then(setPositions).catch(() => {});
  }, []);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleApply = () => {
    onApply({ department, position });
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
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
          <FormSelect
            label="Department"
            value={department}
            onChange={setDepartment}
            options={[
              { value: "", label: "All Departments" },
              ...departments.map((d) => ({ value: d.uuid, label: d.name })),
            ]}
          />
          <FormSelect
            label="Position"
            value={position}
            onChange={setPosition}
            options={[
              { value: "", label: "All Positions" },
              ...positions.map((p) => ({ value: p.uuid, label: p.name })),
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
            onClick={handleApply}
            className="rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
