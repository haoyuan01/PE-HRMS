"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

export type DepartmentFormValues = z.infer<typeof schema>;

interface DepartmentFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  defaultValues?: DepartmentFormValues;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (values: DepartmentFormValues) => void;
}

export function DepartmentFormModal({
  open,
  mode,
  defaultValues,
  isSaving = false,
  onClose,
  onSubmit,
}: DepartmentFormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  // Sync the form with the incoming values each time the modal opens so create
  // starts blank and edit is prefilled with the selected row.
  useEffect(() => {
    if (open) {
      reset(defaultValues ?? { name: "", description: "" });
    }
  }, [open, defaultValues, reset]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        <h2 className="font-display text-lg font-bold text-on-surface">
          {mode === "create" ? "New Department" : "Update Department"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="department-name" className={FIELD_LABEL}>
              Name *
            </Label>
            <Input
              id="department-name"
              placeholder="Enter department name"
              className={FIELD_INPUT}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-ds-error">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="department-description" className={FIELD_LABEL}>
              Description
            </Label>
            <textarea
              id="department-description"
              rows={4}
              placeholder="Enter department description"
              className={`w-full rounded-lg text-sm md:text-sm ${FIELD_INPUT} resize-none focus-visible:outline-none`}
              {...register("description")}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-2.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
