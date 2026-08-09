"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ReceiptDropzone } from "@/components/modules/requests/receipt-dropzone";
import { payrollApi } from "@/lib/api/payroll";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";
const FIELD_SELECT =
  "w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const schema = z.object({
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
  remark: z.string(),
  is_published: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface PayslipFormModalProps {
  userUuid: string;
  userName: string;
  defaultMonth: number;
  defaultYear: number;
  onClose: () => void;
  onSaved: () => void;
}

export function PayslipFormModal({
  userUuid,
  userName,
  defaultMonth,
  defaultYear,
  onClose,
  onSaved,
}: PayslipFormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const years = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() - i
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      month: String(defaultMonth),
      year: String(defaultYear),
      remark: "",
      is_published: true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!attachment) {
      setAttachmentError("A payslip file is required.");
      return;
    }
    try {
      await payrollApi.createPayroll(
        {
          user_uuid: userUuid,
          month: Number(data.month),
          year: Number(data.year),
          remark: data.remark,
          is_published: data.is_published,
        },
        attachment
      );
      toast.success("Payslip added successfully.");
      onSaved();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: unknown } | undefined)
            ?.message as string | undefined)
        : undefined;
      toast.error(
        typeof message === "string"
          ? message
          : "Failed to add payslip. Please try again."
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
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">
              Create New Payslip
            </h2>
            <p className="text-xs text-on-surface-variant">For {userName}</p>
          </div>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pay_month" className={FIELD_LABEL}>
                Month *
              </Label>
              <select
                id="pay_month"
                className={FIELD_SELECT}
                {...register("month")}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay_year" className={FIELD_LABEL}>
                Year *
              </Label>
              <select
                id="pay_year"
                className={FIELD_SELECT}
                {...register("year")}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay_remark" className={FIELD_LABEL}>
              Remark
            </Label>
            <textarea
              id="pay_remark"
              rows={3}
              placeholder="Add a note about this payslip..."
              className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
              {...register("remark")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={FIELD_LABEL}>Payslip File *</Label>
            <ReceiptDropzone
              file={attachment}
              label="Click or drag payslip file here"
              onChange={(f) => {
                setAttachment(f);
                if (f) setAttachmentError(null);
              }}
            />
            {attachmentError && (
              <p className="text-xs text-ds-error">{attachmentError}</p>
            )}
          </div>

          <label className="flex items-center gap-3 rounded-lg bg-surface-container-low px-4 py-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-outline-variant text-ds-primary focus:ring-ds-primary/30"
              {...register("is_published")}
            />
            <span className="text-sm text-on-surface">
              Publish immediately
              <span className="ml-1 text-xs text-on-surface-variant">
                (visible to the employee)
              </span>
            </span>
          </label>
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
            Add Payslip
          </button>
        </div>
      </form>
    </div>
  );
}
