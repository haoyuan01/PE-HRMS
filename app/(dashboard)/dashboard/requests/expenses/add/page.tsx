"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ArrowLeft, Plus, Trash2, Info, ReceiptText } from "lucide-react";
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
import axios from "axios";
import { ReceiptDropzone } from "@/components/modules/requests/receipt-dropzone";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import { claimApi } from "@/lib/api/claim";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const FIELD_TRIGGER =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all w-full rounded-lg text-base md:text-sm h-auto";

const LIST_ROUTE = "/dashboard/requests/expenses";

const schema = z
  .object({
    manager_uuid: z.string().min(1, "Manager is required"),
    travel_location: z.string().min(1, "Travel location is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    items: z
      .array(
        z.object({
          description: z.string().min(1, "Description is required"),
          amount: z.string().min(1, "Amount is required"),
          date: z.string().min(1, "Date is required"),
        })
      )
      .min(1, "Add at least one expense item"),
  })
  .refine(
    (data) =>
      !data.start_date || !data.end_date || data.start_date <= data.end_date,
    {
      message: "End date cannot be before the start date",
      path: ["end_date"],
    }
  );

type FormValues = z.infer<typeof schema>;

const EMPTY_ITEM = { description: "", amount: "", date: "" };

// Local "today" as YYYY-MM-DD for date input min bounds.
function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split("T")[0];
}

export default function AddExpenseClaimPage() {
  const router = useRouter();
  const today = todayISO();
  const [isSaving, setIsSaving] = useState(false);
  const [approvers, setApprovers] = useState<LookupItem[]>([]);
  // Receipt files kept outside RHF (Files don't serialize well); keyed by row id.
  const [receipts, setReceipts] = useState<Record<string, File | null>>({});
  const [receiptErrors, setReceiptErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    lookupApi.getClaimApprovers().then(setApprovers).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      manager_uuid: "",
      travel_location: "",
      start_date: "",
      end_date: "",
      items: [EMPTY_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Constrain the date pickers to each other so the range stays valid.
  const startDate = useWatch({ control, name: "start_date" });
  const endDate = useWatch({ control, name: "end_date" });
  const endMin = startDate && startDate > today ? startDate : today;

  const onSubmit = async (data: FormValues) => {
    // A receipt is required for every expense item (kept outside RHF).
    const missing: Record<string, boolean> = {};
    for (const row of fields) {
      if (!receipts[row.id]) missing[row.id] = true;
    }
    if (Object.keys(missing).length > 0) {
      setReceiptErrors(missing);
      toast.error("Please upload a receipt for every expense item.");
      return;
    }
    setReceiptErrors({});

    setIsSaving(true);
    try {
      await claimApi.createClaimHeader({
        // The claim header "name" is the travel location shown in the list.
        name: data.travel_location,
        manager_approver_uuid: data.manager_uuid,
        start_date: data.start_date,
        end_date: data.end_date,
        items: fields.map((row, i) => ({
          name: data.items[i].description,
          amount: data.items[i].amount,
          date: data.items[i].date,
          attachment: receipts[row.id] ?? undefined,
        })),
      });
      toast.success("Claim submitted successfully.");
      router.push(LIST_ROUTE);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: unknown } | undefined)?.message
        : undefined;
      const text =
        message && typeof message === "object"
          ? String(Object.values(message as Record<string, string[]>)[0]?.[0] ?? "")
          : typeof message === "string"
            ? message
            : "";
      toast.error(text || "Failed to submit claim. Please try again.");
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
            New Expenses Claim
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Please fill in the details below to submit your claim.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-ds-primary" />
            <h2 className="font-display text-sm font-semibold text-on-surface">
              Basic Information
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            {/* Manager for Approval */}
            <div className="space-y-2">
              <Label className={FIELD_LABEL}>Manager for Approval *</Label>
              <Controller
                name="manager_uuid"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={approvers.map((a) => ({ value: a.uuid, label: a.name }))}
                  >
                    <SelectTrigger className={FIELD_TRIGGER}>
                      <SelectValue placeholder="Select Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvers.map((approver) => (
                        <SelectItem
                          key={approver.uuid}
                          value={approver.uuid}
                          label={approver.name}
                        >
                          {approver.name}
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

            {/* Travel Location */}
            <div className="space-y-2">
              <Label htmlFor="travel_location" className={FIELD_LABEL}>
                Travel Location *
              </Label>
              <Input
                id="travel_location"
                placeholder="Enter full address or city"
                className={FIELD_INPUT}
                {...register("travel_location")}
              />
              {errors.travel_location && (
                <p className="text-xs text-ds-error">
                  {errors.travel_location.message}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className={FIELD_LABEL}>
                Travel Period Start Date *
              </Label>
              <Input
                id="start_date"
                type="date"
                min={today}
                max={endDate || undefined}
                className={FIELD_INPUT}
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="text-xs text-ds-error">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date" className={FIELD_LABEL}>
                Travel Period End Date *
              </Label>
              <Input
                id="end_date"
                type="date"
                min={endMin}
                className={FIELD_INPUT}
                {...register("end_date")}
              />
              {errors.end_date && (
                <p className="text-xs text-ds-error">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Expenses Items */}
        <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-ds-primary" />
              <h2 className="font-display text-sm font-semibold text-on-surface">
                Expenses Item
              </h2>
            </div>
            <button
              type="button"
              onClick={() => append(EMPTY_ITEM)}
              className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-3 py-1.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Expense Item
            </button>
          </div>

          {errors.items && typeof errors.items.message === "string" && (
            <p className="mt-3 text-xs text-ds-error">{errors.items.message}</p>
          )}

          <div className="mt-5 space-y-5">
            {fields.map((row, index) => (
              <div
                key={row.id}
                className="relative rounded-xl border border-outline-variant/20 p-4 sm:p-5"
              >
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute right-3 top-3 rounded-md p-1 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Description *</Label>
                  <Input
                    placeholder="Enter expenses description"
                    className={FIELD_INPUT}
                    {...register(`items.${index}.description`)}
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-xs text-ds-error">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>

                {/* Amount + Date */}
                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={FIELD_LABEL}>Amount *</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                        RM
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={`${FIELD_INPUT} pl-11`}
                        {...register(`items.${index}.amount`)}
                      />
                    </div>
                    {errors.items?.[index]?.amount && (
                      <p className="text-xs text-ds-error">
                        {errors.items[index]?.amount?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className={FIELD_LABEL}>Date *</Label>
                    <Input
                      type="date"
                      className={FIELD_INPUT}
                      {...register(`items.${index}.date`)}
                    />
                    {errors.items?.[index]?.date && (
                      <p className="text-xs text-ds-error">
                        {errors.items[index]?.date?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Receipt Upload */}
                <div className="mt-4 space-y-2">
                  <Label className={FIELD_LABEL}>Receipt Upload *</Label>
                  <ReceiptDropzone
                    file={receipts[row.id] ?? null}
                    onChange={(file) => {
                      setReceipts((prev) => ({ ...prev, [row.id]: file }));
                      if (file)
                        setReceiptErrors((prev) => ({ ...prev, [row.id]: false }));
                    }}
                  />
                  {receiptErrors[row.id] && (
                    <p className="text-xs text-ds-error">Receipt is required</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(LIST_ROUTE)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Submitting..." : "Submit Claim"}
          </button>
        </div>
      </form>
    </div>
  );
}
