"use client";

import { useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";
const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

interface ExportModalProps {
  title?: string;
  onClose: () => void;
  // Runs the export for the chosen date range; should resolve when done.
  onExport: (range: { from: string; to: string }) => Promise<void>;
}

export function ExportModal({
  title = "Export to Excel",
  onClose,
  onExport,
}: ExportModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const submit = async () => {
    if (!from || !to) {
      setError("Please select both a start and end date.");
      return;
    }
    if (from > to) {
      setError("The start date cannot be after the end date.");
      return;
    }
    setError(null);
    setIsExporting(true);
    try {
      await onExport({ from, to });
      onClose();
    } catch {
      setError("Failed to export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-on-surface">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">
          Choose the created date range to export.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="export_from" className={FIELD_LABEL}>
              From *
            </Label>
            <Input
              id="export_from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="export_to" className={FIELD_LABEL}>
              To *
            </Label>
            <Input
              id="export_to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-ds-error">{error}</p>}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-5 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isExporting && <Loader2 className="h-4 w-4 animate-spin" />}
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
