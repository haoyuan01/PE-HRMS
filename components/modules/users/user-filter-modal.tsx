"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FIELD_TRIGGER =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all w-full rounded-lg text-base md:text-sm h-auto";

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
          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface-variant">
              Department
            </label>
            <Select
              value={department}
              onValueChange={(v) => setDepartment(v ?? "")}
              items={departments.map((d) => ({ value: d.uuid, label: d.name }))}
            >
              <SelectTrigger className={FIELD_TRIGGER}>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.uuid} value={d.uuid} label={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface-variant">
              Position
            </label>
            <Select
              value={position}
              onValueChange={(v) => setPosition(v ?? "")}
              items={positions.map((p) => ({ value: p.uuid, label: p.name }))}
            >
              <SelectTrigger className={FIELD_TRIGGER}>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Positions</SelectItem>
                {positions.map((p) => (
                  <SelectItem key={p.uuid} value={p.uuid} label={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
