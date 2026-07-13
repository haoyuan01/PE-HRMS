"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ReceiptDropzone } from "@/components/modules/requests/receipt-dropzone";
import { overtimeApi } from "@/lib/api/overtime";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const schema = z.object({
  description: z.string().min(1, "Remark is required"),
});

type FormValues = z.infer<typeof schema>;

export default function OvertimeFormPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: "" },
  });

  const onSubmit = async (data: FormValues) => {
    if (!attachment) {
      setAttachmentError(true);
      toast.error("Please attach a supporting document.");
      return;
    }
    setIsSaving(true);
    try {
      await overtimeApi.createOvertime(
        { description: data.description },
        attachment
      );
      toast.success("Overtime request submitted successfully.");
      reset();
      setAttachment(null);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: unknown } | undefined)
            ?.message as string | undefined)
        : undefined;
      toast.error(
        typeof message === "string"
          ? message
          : "Failed to submit overtime request. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Management &middot; Requests
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          Overtime Request
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Submit your overtime with a remark and supporting document.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-5">
          {/* Remark */}
          <div className="space-y-2">
            <Label htmlFor="description" className={FIELD_LABEL}>
              Remark *
            </Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the overtime work..."
              className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-ds-error">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Attachment */}
          <div className="space-y-2">
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
                A supporting document is required.
              </p>
            )}
          </div>
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
