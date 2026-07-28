"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, format, parseISO } from "date-fns";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReceiptDropzone } from "@/components/modules/requests/receipt-dropzone";
import { LeaveDateCalendar } from "@/components/modules/requests/leave-date-calendar";
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

// Per-date duration option -> how many days it counts for.
type Duration = "full" | "first_half" | "second_half";
const DURATION_DAYS: Record<Duration, number> = {
  full: 1,
  first_half: 0.5,
  second_half: 0.5,
};

// A resume date should land on a working day — roll weekends to Monday.
function nextWeekday(d: Date): Date {
  const dow = d.getDay(); // 0 = Sun, 6 = Sat
  if (dow === 6) return addDays(d, 2);
  if (dow === 0) return addDays(d, 1);
  return d;
}

// Resume date from the last leave day: first half (AM) resumes the same day
// (back for the afternoon); full / second half (PM) resumes the next day.
function computeResumeDate(lastDate: string, duration: Duration): string {
  const base = parseISO(lastDate);
  const candidate = duration === "first_half" ? base : addDays(base, 1);
  return format(nextWeekday(candidate), "yyyy-MM-dd");
}

const schema = z.object({
  application_date: z.string().min(1, "Date of application is required"),
  manager_uuid: z.string().min(1, "Approving manager is required"),
  leave_policy_uuid: z.string().min(1, "Leave type is required"),
  resume_date: z.string().min(1, "Date of resume is required"),
  reason: z.string().min(1, "Reason is required"),
  handover_uuid: z.string(),
  handover_remark: z.string(),
  request_dates: z
    .array(
      z.object({
        date: z.string().min(1, "Date is required"),
        duration: z.enum(["full", "first_half", "second_half"]),
      })
    )
    .min(1, "Select at least one leave date"),
});

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
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      application_date: todayISO(),
      manager_uuid: "",
      leave_policy_uuid: "",
      resume_date: "",
      reason: "",
      handover_uuid: "",
      handover_remark: "",
      request_dates: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "request_dates",
  });

  const [policyUuid, requestDates] = useWatch({
    control,
    name: ["leave_policy_uuid", "request_dates"],
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

  // Changing the leave type clears any picked dates — the notice period and
  // half-day rules differ per policy, so the user re-selects.
  useEffect(() => {
    replace([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyUuid]);

  // Total days claimed — full = 1, half = 0.5.
  const totalDays = (requestDates ?? []).reduce(
    (sum, d) => sum + DURATION_DAYS[d.duration as Duration],
    0
  );

  // Handover only applies when the policy requires it (is_handover_required);
  // then it's needed once the leave length reaches handover_min_days.
  const handoverMin = selectedPolicy
    ? Number(selectedPolicy.handover_min_days)
    : 0;
  const handoverRequired =
    !!selectedPolicy?.is_handover_required && totalDays >= handoverMin;

  // Auto-preselect the resume date from the last leave day (see helper). It
  // recomputes whenever the selection changes; the user can still override.
  const lastEntry =
    (requestDates ?? []).length > 0
      ? (requestDates ?? []).reduce((a, b) => (a.date >= b.date ? a : b))
      : null;
  const resumeAuto = lastEntry
    ? computeResumeDate(lastEntry.date, lastEntry.duration as Duration)
    : "";
  const resumeMin = resumeAuto || earliestStart;

  useEffect(() => {
    setValue("resume_date", resumeAuto);
  }, [resumeAuto, setValue]);

  // Clicking a calendar day toggles it in/out of the selection.
  const toggleDate = (date: string) => {
    const current = getValues("request_dates");
    const idx = current.findIndex((d) => d.date === date);
    if (idx >= 0) {
      remove(idx);
      return;
    }
    if (date < earliestStart) {
      toast.error(
        minNoticeDays > 0
          ? `This leave needs ${minNoticeDays} day(s) notice — earliest date is ${earliestStart}.`
          : "That date is in the past."
      );
      return;
    }
    append({ date, duration: "full" });
  };

  const onSubmit = async (data: FormValues) => {
    if (handoverRequired && !data.handover_uuid) {
      setError("handover_uuid", {
        message: "Handover person is required for this leave length",
      });
      return;
    }
    if (handoverRequired && !data.handover_remark) {
      setError("handover_remark", { message: "Handover remark is required" });
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
          resume_date: data.resume_date,
          total_days: totalDays,
          reason: data.reason,
          request_dates: data.request_dates.map((d) => ({
            date: d.date,
            is_half_day: d.duration !== "full",
            if_first_half: d.duration === "first_half",
          })),
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
            Please fill in the details below to submit your leave application.
          </p>
        </div>
      </div>

      {/* Leave balance summary — how many days the user has left per type. */}
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
                  items={policies.map((p) => ({
                    value: p.uuid,
                    label: `${p.name} (${p.code})`,
                  }))}
                >
                  <SelectTrigger className={FIELD_TRIGGER}>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((p) => (
                      <SelectItem
                        key={p.uuid}
                        value={p.uuid}
                        label={`${p.name} (${p.code})`}
                      >
                        {p.name} ({p.code})
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

          {/* Leave Duration — pick dates on the calendar, each with a config */}
          <div className="space-y-2 md:col-span-2">
            <Label className={FIELD_LABEL}>Leave Duration (Select Dates) *</Label>
            <LeaveDateCalendar
              selected={fields.map((f) => f.date)}
              onToggle={toggleDate}
              minDate={earliestStart}
              disabled={datesDisabled}
            />
            {datesDisabled && (
              <p className="text-xs text-on-surface-variant">
                Select a leave type first to pick your dates.
              </p>
            )}
            {errors.request_dates &&
              !Array.isArray(errors.request_dates) &&
              "message" in errors.request_dates && (
                <p className="text-xs text-ds-error">
                  {errors.request_dates.message as string}
                </p>
              )}
          </div>

          {/* Selected Dates Configuration */}
          {fields.length > 0 && (
            <div className="space-y-2 md:col-span-2">
              <p className={FIELD_LABEL}>Selected Dates Configuration</p>
              <div className="divide-y divide-outline-variant/20 overflow-hidden rounded-lg border border-outline-variant/20">
                {fields.map((f, index) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 bg-surface-container-low/40 px-4 py-3"
                  >
                    <span className="flex-1 text-sm text-on-surface">
                      {format(parseISO(f.date), "dd MMM yyyy")}
                    </span>
                    <Controller
                      name={`request_dates.${index}.duration`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          items={[
                            { value: "full", label: "Full Day" },
                            ...(allowHalfDay
                              ? [
                                  { value: "first_half", label: "First Half (AM)" },
                                  { value: "second_half", label: "Second Half (PM)" },
                                ]
                              : []),
                          ]}
                        >
                          <SelectTrigger className="h-9 w-40 rounded-lg border-0 bg-surface-container-lowest px-3 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full" label="Full Day">
                              Full Day
                            </SelectItem>
                            {allowHalfDay && (
                              <>
                                <SelectItem value="first_half" label="First Half (AM)">
                                  First Half (AM)
                                </SelectItem>
                                <SelectItem value="second_half" label="Second Half (PM)">
                                  Second Half (PM)
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                      title="Remove date"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant">
                Total: {totalDays} day{totalDays === 1 ? "" : "s"}
              </p>
            </div>
          )}

          {/* Date of Resume */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="resume_date" className={FIELD_LABEL}>
              Date of Resume *
            </Label>
            <Input
              id="resume_date"
              type="date"
              min={resumeMin}
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
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(LIST_ROUTE)}
            className="rounded-[0.75rem] px-6 py-3 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
