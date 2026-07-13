"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReceiptDropzone } from "@/components/modules/requests/receipt-dropzone";
import { useAuthStore } from "@/stores/useAuthStore";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import { leavePolicyApi } from "@/lib/api/leavePolicy";
import { leaveEntitlementApi } from "@/lib/api/leaveEntitlement";
import { leaveRequestApi } from "@/lib/api/leaveRequest";
import type { LeavePolicy } from "@/types/leave-policy";
import type { LeaveEntitlement } from "@/types/leave-entitlement";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";
const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";
const FIELD_TRIGGER =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all w-full rounded-lg text-base md:text-sm h-auto";

const LIST_ROUTE = "/dashboard/requests/leave";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const schema = z
  .object({
    application_date: z.string().min(1, "Date of application is required"),
    manager_uuid: z.string().min(1, "Approving manager is required"),
    leave_policy_uuid: z.string().min(1, "Leave type is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    resume_date: z.string().min(1, "Date of resume is required"),
    reason: z.string().min(1, "Reason is required"),
    handover_uuid: z.string(),
    handover_remark: z.string(),
    is_half_day: z.boolean(),
  })
  .refine(
    (d) => !d.start_date || !d.end_date || d.start_date <= d.end_date,
    { message: "End date cannot be before the start date", path: ["end_date"] }
  );

type FormValues = z.infer<typeof schema>;

export default function AddLeaveRequestPage() {
  const router = useRouter();
  const today = todayISO();
  const currentUserUuid = useAuthStore((s) => s.user?.uuid);
  const [isSaving, setIsSaving] = useState(false);
  const [managers, setManagers] = useState<LookupItem[]>([]);
  const [users, setUsers] = useState<LookupItem[]>([]);
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  // Maps a leave policy uuid -> the current user's entitlement uuid for it,
  // since the create API needs leave_entitlement_uuid (not the policy uuid).
  const [entitlementByPolicy, setEntitlementByPolicy] = useState<
    Record<string, string>
  >({});
  const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
  const [entitlementsLoading, setEntitlementsLoading] = useState(true);
  // Attachment kept outside RHF (Files don't serialize well).
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState(false);

  useEffect(() => {
    lookupApi.getManagerApprovers().then(setManagers).catch(() => {});
    lookupApi.getUsers().then(setUsers).catch(() => {});
    leavePolicyApi
      .getLeavePolicies({ size: 100 })
      .then((res) => setPolicies(res.data))
      .catch(() => {});
  }, []);

  // Load the current user's entitlements so a selected leave type resolves to
  // its leave_entitlement_uuid.
  useEffect(() => {
    if (!currentUserUuid) return;
    leaveEntitlementApi
      .getLeaveEntitlements({ user_uuid: currentUserUuid })
      .then((res) => {
        const me =
          res.data.find((u) => u.uuid === currentUserUuid) ?? res.data[0];
        const list = me?.leave_entitlements ?? [];
        setEntitlements(list);
        const map: Record<string, string> = {};
        list.forEach((e) => {
          map[e.leave_policy.uuid] = e.uuid;
        });
        setEntitlementByPolicy(map);
      })
      .catch(() => {})
      .finally(() => setEntitlementsLoading(false));
  }, [currentUserUuid]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      application_date: todayISO(),
      manager_uuid: "",
      leave_policy_uuid: "",
      start_date: "",
      end_date: "",
      resume_date: "",
      reason: "",
      handover_uuid: "",
      handover_remark: "",
      is_half_day: false,
    },
  });

  const [policyUuid, startDate, endDate, isHalfDay, resumeDate] = useWatch({
    control,
    name: [
      "leave_policy_uuid",
      "start_date",
      "end_date",
      "is_half_day",
      "resume_date",
    ],
  });

  const selectedPolicy = policies.find((p) => p.uuid === policyUuid);
  const allowHalfDay = selectedPolicy?.allow_half_day ?? false;
  const requiresAttachment = selectedPolicy?.requires_attachment ?? false;
  // Dates only become selectable once a leave type is chosen.
  const datesDisabled = !policyUuid;

  // The policy's notice period: leave can only start this many days from today.
  const minNoticeDays = selectedPolicy
    ? Number(selectedPolicy.min_notice_days)
    : 0;
  const earliestStart = format(
    addDays(parseISO(today), minNoticeDays || 0),
    "yyyy-MM-dd"
  );

  // Clear the half-day flag if the chosen leave type doesn't allow it.
  useEffect(() => {
    if (!allowHalfDay && isHalfDay) setValue("is_half_day", false);
  }, [allowHalfDay, isHalfDay, setValue]);

  // A half-day leave is a single day, so the end date mirrors the start date.
  useEffect(() => {
    if (isHalfDay) setValue("end_date", startDate ?? "");
  }, [isHalfDay, startDate, setValue]);

  // Start can't be before the notice cutoff; the end can't precede the start.
  const endMin =
    startDate && startDate > earliestStart ? startDate : earliestStart;

  // If a stricter notice period pushes the cutoff past the chosen start date,
  // clear the now-invalid start (and its mirrored end when half-day).
  useEffect(() => {
    if (startDate && startDate < earliestStart) {
      setValue("start_date", "");
      if (isHalfDay) setValue("end_date", "");
    }
  }, [earliestStart, startDate, isHalfDay, setValue]);

  // Resume can only be the end date or the day after it (and never in the past).
  const resumeMin = endDate || earliestStart;
  const resumeMax = endDate
    ? format(addDays(parseISO(endDate), 1), "yyyy-MM-dd")
    : undefined;

  // Clear a resume date that no longer fits the end-date window.
  useEffect(() => {
    if (!resumeDate || !endDate) return;
    if (resumeDate < endDate || (resumeMax && resumeDate > resumeMax)) {
      setValue("resume_date", "");
    }
  }, [resumeDate, endDate, resumeMax, setValue]);

  // Inclusive leave duration in days (e.g. 1 Aug – 2 Aug = 2 days).
  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
  }, [startDate, endDate]);

  // Handover only applies when the policy requires it (is_handover_required);
  // then it's needed once the leave length reaches handover_min_days.
  const handoverMin = selectedPolicy
    ? Number(selectedPolicy.handover_min_days)
    : 0;
  const handoverRequired =
    !!selectedPolicy?.is_handover_required && durationDays >= handoverMin;

  // Total days claimed — a half day counts as 0.5, otherwise the inclusive span.
  const totalDays = isHalfDay ? 0.5 : durationDays;

  const onSubmit = async (data: FormValues) => {
    if (data.start_date < earliestStart) {
      setError("start_date", {
        message: `This leave requires ${minNoticeDays} day(s) notice — earliest start is ${earliestStart}.`,
      });
      return;
    }
    if (
      data.end_date &&
      resumeMax &&
      (data.resume_date < data.end_date || data.resume_date > resumeMax)
    ) {
      setError("resume_date", {
        message: "Resume date must be the end date or the day after.",
      });
      return;
    }
    if (handoverRequired && !data.handover_uuid) {
      setError("handover_uuid", {
        message: "Handover person is required for this leave length",
      });
      return;
    }
    if (handoverRequired && !data.handover_remark) {
      setError("handover_remark", {
        message: "Handover remark is required",
      });
      return;
    }
    if (requiresAttachment && !attachment) {
      setAttachmentError(true);
      toast.error("This leave type requires a supporting document.");
      return;
    }
    // Resolve the selected leave type to the user's entitlement uuid.
    const entitlementUuid = entitlementByPolicy[data.leave_policy_uuid];
    if (!entitlementUuid) {
      setError("leave_policy_uuid", {
        message: "You don't have an entitlement for this leave type.",
      });
      return;
    }

    setIsSaving(true);
    try {
      await leaveRequestApi.createLeaveRequest(
        {
          manager_approver_uuid: data.manager_uuid,
          leave_entitlement_uuid: entitlementUuid,
          start_date: data.start_date,
          end_date: data.end_date,
          resume_date: data.resume_date,
          total_days: totalDays,
          is_half_day: data.is_half_day,
          is_first_half: false,
          reason: data.reason,
          ...(handoverRequired
            ? {
                handover_by_uuid: data.handover_uuid,
                handover_remark: data.handover_remark,
              }
            : {}),
        },
        requiresAttachment ? attachment ?? undefined : undefined
      );
      toast.success("Leave request submitted successfully.");
      router.push(LIST_ROUTE);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: unknown } | undefined)?.message
        : undefined;
      toast.error(
        typeof message === "string"
          ? message
          : "Failed to submit leave request. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(LIST_ROUTE)}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
            New Leave Request
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Submit your application for time off. Ensure your dates and manager
            are correctly selected before submitting.
          </p>
        </div>
      </div>

      {/* Leave balance summary — how many days the user has left per type. The
          container stays put while loading and shows skeleton placeholders. */}
      {(entitlementsLoading || entitlements.length > 0) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {entitlementsLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]"
                >
                  <div className="h-3 w-24 animate-pulse rounded bg-surface-container-high" />
                  <div className="mt-2 h-8 w-28 animate-pulse rounded bg-surface-container-high" />
                  <div className="mt-2 h-3 w-16 animate-pulse rounded bg-surface-container-high" />
                </div>
              ))
            : entitlements.map((e) => (
                <div
                  key={e.uuid}
                  className="rounded-2xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]"
                >
                  <p className="truncate text-xs font-medium uppercase tracking-widest text-on-surface-variant">
                    {e.leave_policy.name}
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold tracking-tight text-on-surface">
                    {Number(e.balance_days)}
                    <span className="text-sm font-medium text-on-surface-variant">
                      {" "}
                      / {Number(e.entitled_days)} days
                    </span>
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {Number(e.used_days)} used
                  </p>
                </div>
              ))}
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          {/* Date of Application */}
          <div className="space-y-2">
            <Label htmlFor="application_date" className={FIELD_LABEL}>
              Date of Application *
            </Label>
            <Input
              id="application_date"
              type="date"
              className={FIELD_INPUT}
              {...register("application_date")}
            />
            {errors.application_date && (
              <p className="text-xs text-ds-error">
                {errors.application_date.message}
              </p>
            )}
          </div>

          {/* Approving Manager */}
          <div className="space-y-2">
            <Label className={FIELD_LABEL}>Approving Manager *</Label>
            <Controller
              name="manager_uuid"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={managers.map((m) => ({ value: m.uuid, label: m.name }))}
                >
                  <SelectTrigger className={FIELD_TRIGGER}>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((m) => (
                      <SelectItem key={m.uuid} value={m.uuid} label={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.manager_uuid && (
              <p className="text-xs text-ds-error">
                {errors.manager_uuid.message}
              </p>
            )}
          </div>

          {/* Leave Type */}
          <div className="space-y-2 md:col-span-2">
            <Label className={FIELD_LABEL}>Leave Type *</Label>
            <Controller
              name="leave_policy_uuid"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={policies.map((p) => ({ value: p.uuid, label: p.name }))}
                >
                  <SelectTrigger className={FIELD_TRIGGER}>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((p) => (
                      <SelectItem key={p.uuid} value={p.uuid} label={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.leave_policy_uuid && (
              <p className="text-xs text-ds-error">
                {errors.leave_policy_uuid.message}
              </p>
            )}
          </div>

          {/* Half Day — only for leave types that allow it */}
          {allowHalfDay && (
            <div className="md:col-span-2">
              <Controller
                name="is_half_day"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_half_day"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      className="size-[18px] rounded border-2 border-on-surface-variant/40 data-checked:border-ds-primary data-checked:bg-ds-primary data-checked:text-white"
                    />
                    <label
                      htmlFor="is_half_day"
                      className="cursor-pointer select-none text-sm text-on-surface"
                    >
                      Half Day
                    </label>
                  </div>
                )}
              />
            </div>
          )}

          {/* Dates */}
          <div className="space-y-2">
            <Label htmlFor="start_date" className={FIELD_LABEL}>
              Start Date *
            </Label>
            <Input
              id="start_date"
              type="date"
              min={earliestStart}
              disabled={datesDisabled}
              className={`${FIELD_INPUT} disabled:cursor-not-allowed disabled:opacity-60`}
              {...register("start_date")}
            />
            {errors.start_date && (
              <p className="text-xs text-ds-error">{errors.start_date.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date" className={FIELD_LABEL}>
              End Date *
            </Label>
            <Input
              id="end_date"
              type="date"
              min={endMin}
              disabled={isHalfDay || datesDisabled}
              className={`${FIELD_INPUT} disabled:cursor-not-allowed disabled:opacity-60`}
              {...register("end_date")}
            />
            {errors.end_date && (
              <p className="text-xs text-ds-error">{errors.end_date.message}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="resume_date" className={FIELD_LABEL}>
              Date of Resume *
            </Label>
            <Input
              id="resume_date"
              type="date"
              min={resumeMin}
              max={resumeMax}
              disabled={datesDisabled}
              className={`${FIELD_INPUT} disabled:cursor-not-allowed disabled:opacity-60`}
              {...register("resume_date")}
            />
            {errors.resume_date && (
              <p className="text-xs text-ds-error">
                {errors.resume_date.message}
              </p>
            )}
          </div>

          {/* Handover Person — only when the leave length needs a handover */}
          {handoverRequired && (
            <div className="space-y-2 md:col-span-2">
              <Label className={FIELD_LABEL}>Handover Person *</Label>
              <Controller
                name="handover_uuid"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={users.map((u) => ({ value: u.uuid, label: u.name }))}
                  >
                    <SelectTrigger className={FIELD_TRIGGER}>
                      <SelectValue placeholder="Select handover person" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.uuid} value={u.uuid} label={u.name}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.handover_uuid && (
                <p className="text-xs text-ds-error">
                  {errors.handover_uuid.message}
                </p>
              )}
            </div>
          )}

          {/* Handover Remark — paired with the handover person */}
          {handoverRequired && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="handover_remark" className={FIELD_LABEL}>
                Handover Remark *
              </Label>
              <textarea
                id="handover_remark"
                rows={3}
                placeholder="Describe what will be handed over during your leave..."
                className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
                {...register("handover_remark")}
              />
              {errors.handover_remark && (
                <p className="text-xs text-ds-error">
                  {errors.handover_remark.message}
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="reason" className={FIELD_LABEL}>
              Reason for Leave *
            </Label>
            <textarea
              id="reason"
              rows={4}
              placeholder="Briefly describe the reason for your request..."
              className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-xs text-ds-error">{errors.reason.message}</p>
            )}
          </div>

          {/* Supporting document — required by some leave types */}
          {requiresAttachment && (
            <div className="space-y-2 md:col-span-2">
              <Label className={FIELD_LABEL}>Supporting Document *</Label>
              <ReceiptDropzone
                file={attachment}
                label="Click or drag document here"
                onChange={(f) => {
                  setAttachment(f);
                  if (f) setAttachmentError(false);
                }}
              />
              {attachmentError && (
                <p className="text-xs text-ds-error">
                  A supporting document is required for this leave type.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
