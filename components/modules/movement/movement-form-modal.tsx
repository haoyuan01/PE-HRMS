"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { movementApi } from "@/lib/api/movement";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import type { Movement } from "@/types/movement";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";
const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";
const FIELD_SELECT =
  "w-full rounded-lg border-0 bg-surface-container-low py-3 pl-4 pr-10 text-sm text-on-surface focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const schema = z
  .object({
    user_uuid: z.string().min(1, "Staff is required"),
    movement_type_uuid: z.string().min(1, "Movement type is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string(),
    location: z.string(),
    description: z.string(),
  })
  .refine(
    (d) => !d.end_date || !d.start_date || d.start_date <= d.end_date,
    { message: "End date cannot be before the start date", path: ["end_date"] }
  );

type FormValues = z.infer<typeof schema>;

interface MovementFormModalProps {
  // When provided, the modal edits this movement instead of creating one.
  movement?: Movement;
  onClose: () => void;
  onSaved: () => void;
}

export function MovementFormModal({
  movement,
  onClose,
  onSaved,
}: MovementFormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [staff, setStaff] = useState<LookupItem[]>([]);
  const [movementTypes, setMovementTypes] = useState<LookupItem[]>([]);
  const isEdit = !!movement;

  useEffect(() => {
    lookupApi.getUsers().then(setStaff).catch(() => {});
    lookupApi.getMovementTypes().then(setMovementTypes).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      user_uuid: movement?.user?.uuid ?? "",
      movement_type_uuid: movement?.movement_type?.uuid ?? "",
      start_date: movement?.start_date?.split("T")[0] ?? "",
      end_date: movement?.end_date?.split("T")[0] ?? "",
      location: movement?.location ?? "",
      description: movement?.description ?? "",
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  // End Date can't be before Start Date — clear it if it becomes invalid.
  useEffect(() => {
    if (endDate && startDate && endDate < startDate) {
      setValue("end_date", "");
    }
  }, [startDate, endDate, setValue]);

  // The <select> options load asynchronously, so re-apply the edit values once
  // the matching options exist — otherwise the native select falls back to
  // "Select ..." and the staff / movement type look unselected.
  useEffect(() => {
    if (movement && staff.length) {
      setValue("user_uuid", movement.user?.uuid ?? "");
    }
  }, [staff, movement, setValue]);
  useEffect(() => {
    if (movement && movementTypes.length) {
      setValue("movement_type_uuid", movement.movement_type?.uuid ?? "");
    }
  }, [movementTypes, movement, setValue]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      user_uuid: data.user_uuid,
      movement_type_uuid: data.movement_type_uuid,
      start_date: data.start_date,
      end_date: data.end_date || null,
      location: data.location || null,
      description: data.description || null,
    };
    try {
      if (movement) {
        await movementApi.updateMovement(movement.uuid, payload);
        toast.success("Movement updated successfully.");
      } else {
        await movementApi.createMovement(payload);
        toast.success("Movement added successfully.");
      }
      onSaved();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: unknown } | undefined)
            ?.message as string | undefined)
        : undefined;
      toast.error(
        typeof message === "string"
          ? message
          : `Failed to ${isEdit ? "update" : "add"} movement. Please try again.`
      );
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-on-surface">
            {isEdit ? "Edit Movement" : "New Movement"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="mv_staff" className={FIELD_LABEL}>
              Staff *
            </Label>
            <select id="mv_staff" className={FIELD_SELECT} {...register("user_uuid")}>
              <option value="">Select staff</option>
              {staff.map((s) => (
                <option key={s.uuid} value={s.uuid}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.user_uuid && (
              <p className="text-xs text-ds-error">{errors.user_uuid.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mv_type" className={FIELD_LABEL}>
              Movement Type *
            </Label>
            <select
              id="mv_type"
              className={FIELD_SELECT}
              {...register("movement_type_uuid")}
            >
              <option value="">Select movement type</option>
              {movementTypes.map((t) => (
                <option key={t.uuid} value={t.uuid}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.movement_type_uuid && (
              <p className="text-xs text-ds-error">
                {errors.movement_type_uuid.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="mv_start" className={FIELD_LABEL}>
                Start Date *
              </Label>
              <Input
                id="mv_start"
                type="date"
                className={FIELD_INPUT}
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="text-xs text-ds-error">
                  {errors.start_date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mv_end" className={FIELD_LABEL}>
                End Date
              </Label>
              <Input
                id="mv_end"
                type="date"
                min={startDate || undefined}
                disabled={!startDate}
                className={`${FIELD_INPUT} disabled:cursor-not-allowed disabled:opacity-60`}
                {...register("end_date")}
              />
              {errors.end_date && (
                <p className="text-xs text-ds-error">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mv_location" className={FIELD_LABEL}>
              Location
            </Label>
            <Input
              id="mv_location"
              placeholder="Enter location"
              className={FIELD_INPUT}
              {...register("location")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mv_description" className={FIELD_LABEL}>
              Description
            </Label>
            <textarea
              id="mv_description"
              rows={3}
              placeholder="Add a note about this movement..."
              className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
              {...register("description")}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-outline-variant/20 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Movement"}
          </button>
        </div>
      </form>
    </div>
  );
}
