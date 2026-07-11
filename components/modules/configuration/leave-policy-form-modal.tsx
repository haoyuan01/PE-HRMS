"use client";

import { useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { leavePolicyApi, type LeavePolicyPayload } from "@/lib/api/leavePolicy";
import type { LeavePolicy } from "@/types/leave-policy";

const LABEL = "text-xs font-medium uppercase tracking-wider text-on-surface-variant";

// The backend returns validation errors either as a plain string or as a
// { field: [message, ...] } object under `message`. Pull out something useful.
function extractErrorMessage(err: unknown, isEdit: boolean): string {
  const fallback = `Failed to ${isEdit ? "update" : "create"} leave policy. Please try again.`;
  if (!axios.isAxiosError(err)) return fallback;
  const message = (err.response?.data as { message?: unknown } | undefined)?.message;
  if (typeof message === "string") return message;
  if (message && typeof message === "object") {
    const first = Object.values(message as Record<string, string[]>)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  }
  return fallback;
}

const tierSchema = z.object({
  service_year_from: z.string(),
  service_year_to: z.string(),
  entitlement_days: z.string(),
});

// Optional numeric field that, when filled, must fall within [min, max].
const optionalRange = (min: number, max: number, label: string) =>
  z.string().refine(
    (v) => v === "" || (Number(v) >= min && Number(v) <= max),
    `${label} must be between ${min} and ${max}`
  );

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string(),
  allow_half_day: z.boolean(),
  requires_attachment: z.boolean(),
  is_paid: z.boolean(),
  is_handover_required: z.boolean(),
  min_notice_days: z.string(),
  carry_forward_days: z.string(),
  carry_forward_expiry_date: optionalRange(1, 31, "Carry forward date"),
  carry_forward_expiry_month: optionalRange(1, 12, "Carry forward month"),
  handover_min_days: z.string(),
  leave_policy_tiers: z.array(tierSchema).min(1, "Add at least one tier"),
});

type FormValues = z.infer<typeof schema>;

// Backend returns decimals like "6.00"; show them as clean numbers in inputs.
function num(value: string | null): string {
  if (value == null || value === "") return "";
  const n = Number(value);
  return Number.isNaN(n) ? "" : String(n);
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-on-surface">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-ds-primary" : "bg-surface-container-high"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

// Blank form used when creating a new policy (no prefill).
const EMPTY_VALUES: FormValues = {
  name: "",
  code: "",
  description: "",
  allow_half_day: false,
  requires_attachment: false,
  is_paid: false,
  is_handover_required: false,
  min_notice_days: "",
  carry_forward_days: "",
  carry_forward_expiry_date: "",
  carry_forward_expiry_month: "",
  handover_min_days: "",
  leave_policy_tiers: [],
};

interface LeavePolicyFormModalProps {
  // null → create a new policy; otherwise edit the given policy.
  policy: LeavePolicy | null;
  onClose: () => void;
  onSaved: () => void;
}

export function LeavePolicyFormModal({
  policy,
  onClose,
  onSaved,
}: LeavePolicyFormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = policy !== null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: policy
      ? {
          name: policy.name,
          code: policy.code,
          description: policy.description ?? "",
          allow_half_day: policy.allow_half_day,
          requires_attachment: policy.requires_attachment,
          is_paid: policy.is_paid,
          is_handover_required: policy.is_handover_required,
          min_notice_days: num(policy.min_notice_days),
          carry_forward_days: num(policy.carry_forward_days),
          carry_forward_expiry_date: num(policy.carry_forward_expiry_date),
          carry_forward_expiry_month: num(policy.carry_forward_expiry_month),
          handover_min_days: num(policy.handover_min_days),
          leave_policy_tiers: policy.leave_policy_tiers.map((t) => ({
            service_year_from: num(t.service_year_from),
            service_year_to: num(t.service_year_to),
            entitlement_days: num(t.entitlement_days),
          })),
        }
      : EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "leave_policy_tiers",
  });

  const onSubmit = async (data: FormValues) => {
    const payload: LeavePolicyPayload = {
      name: data.name,
      code: data.code,
      description: data.description,
      allow_half_day: data.allow_half_day,
      requires_attachment: data.requires_attachment,
      is_paid: data.is_paid,
      is_handover_required: data.is_handover_required,
      carry_forward_days: Number(data.carry_forward_days) || 0,
      min_notice_days: Number(data.min_notice_days) || 0,
      handover_min_days: Number(data.handover_min_days) || 0,
      leave_policy_tiers: data.leave_policy_tiers.map((t) => ({
        service_year_from: Number(t.service_year_from) || 0,
        service_year_to: Number(t.service_year_to) || 0,
        entitlement_days: Number(t.entitlement_days) || 0,
      })),
    };
    // The backend rejects 0 for these (must be 1-12 / 1-31), so only send them
    // when the user actually provided a value.
    if (data.carry_forward_expiry_month !== "")
      payload.carry_forward_expiry_month = Number(data.carry_forward_expiry_month);
    if (data.carry_forward_expiry_date !== "")
      payload.carry_forward_expiry_date = Number(data.carry_forward_expiry_date);

    try {
      if (policy) {
        await leavePolicyApi.updateLeavePolicy(policy.uuid, payload);
        toast.success("Leave policy updated successfully.");
      } else {
        await leavePolicyApi.createLeavePolicy(payload);
        toast.success("Leave policy created successfully.");
      }
      onSaved();
    } catch (err) {
      toast.error(extractErrorMessage(err, isEdit));
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-on-surface">
            {isEdit ? "Update Leave Policy" : "Add Leave Policy"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form
          id="leave-policy-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
        >
          {/* Name + Code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={LABEL}>Name</label>
              <Input {...register("name")} />
              {errors.name && (
                <p className="text-xs text-ds-error">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Code</label>
              <Input {...register("code")} />
              {errors.code && (
                <p className="text-xs text-ds-error">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className={LABEL}>Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
            />
          </div>

          {/* Toggle row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              control={control}
              name="allow_half_day"
              render={({ field }) => (
                <Toggle
                  label="Allow Half Day"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="requires_attachment"
              render={({ field }) => (
                <Toggle
                  label="Requires Attachment"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="is_paid"
              render={({ field }) => (
                <Toggle
                  label="Is Paid Leave"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Notice / carry forward days / handover required */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Min. Notice Days</label>
              <Input type="number" step="any" {...register("min_notice_days")} />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Carry Forward Days</label>
              <Input type="number" step="any" {...register("carry_forward_days")} />
            </div>
            <div className="flex items-end pb-2.5">
              <Controller
                control={control}
                name="is_handover_required"
                render={({ field }) => (
                  <div className="w-full">
                    <Toggle
                      label="Hand Over Required"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Carry forward date + handover min days */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Carry Forward Date (Day)</label>
              <Input
                type="number"
                step="any"
                {...register("carry_forward_expiry_date")}
              />
              {errors.carry_forward_expiry_date && (
                <p className="text-xs text-ds-error">
                  {errors.carry_forward_expiry_date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Carry Forward Month</label>
              <Input
                type="number"
                step="any"
                {...register("carry_forward_expiry_month")}
              />
              {errors.carry_forward_expiry_month && (
                <p className="text-xs text-ds-error">
                  {errors.carry_forward_expiry_month.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Handover Min Days</label>
              <Input type="number" step="any" {...register("handover_min_days")} />
            </div>
          </div>

          {/* Tiers */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-on-surface">
                Tiers
              </h3>
              <button
                type="button"
                onClick={() =>
                  append({
                    service_year_from: "",
                    service_year_to: "",
                    entitlement_days: "",
                  })
                }
                className="flex items-center gap-1.5 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
              >
                <Plus className="h-4 w-4" />
                Add Tier
              </button>
            </div>

            {errors.leave_policy_tiers?.message && (
              <p className="text-xs text-ds-error">
                {errors.leave_policy_tiers.message}
              </p>
            )}

            {fields.length === 0 && (
              <p className="text-sm text-on-surface-variant">No tiers added.</p>
            )}

            {fields.map((tier, index) => (
              <div key={tier.id} className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className={LABEL}>Min Service Year</label>
                  <Input
                    type="number"
                    step="any"
                    {...register(`leave_policy_tiers.${index}.service_year_from`)}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className={LABEL}>Max Service Year</label>
                  <Input
                    type="number"
                    step="any"
                    {...register(`leave_policy_tiers.${index}.service_year_to`)}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className={LABEL}>Entitled Days</label>
                  <Input
                    type="number"
                    step="any"
                    {...register(`leave_policy_tiers.${index}.entitlement_days`)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mb-1 rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                  title="Remove tier"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </form>

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
            form="leave-policy-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
