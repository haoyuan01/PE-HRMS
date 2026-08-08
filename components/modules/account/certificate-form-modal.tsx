"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { FileText, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReceiptDropzone } from "@/components/modules/requests/receipt-dropzone";
import { certificateApi } from "@/lib/api/certificate";
import type { UserCertificate } from "@/types/certificate";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";
const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const schema = z
  .object({
    name: z.string().min(1, "Certificate name is required"),
    organization: z.string().min(1, "Organization is required"),
    description: z.string(),
    date_applied: z.string().min(1, "Date applied is required"),
    valid_until: z.string().min(1, "Valid until is required"),
  })
  .refine(
    (d) =>
      !d.date_applied || !d.valid_until || d.date_applied <= d.valid_until,
    { message: "Valid until cannot be before the date applied", path: ["valid_until"] }
  );

type FormValues = z.infer<typeof schema>;

interface CertificateFormModalProps {
  userUuid: string;
  // When provided, the modal edits this certificate instead of creating one.
  certificate?: UserCertificate;
  onClose: () => void;
  onSaved: () => void;
}

export function CertificateFormModal({
  userUuid,
  certificate,
  onClose,
  onSaved,
}: CertificateFormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  // Whether the existing (already-uploaded) attachment has been cleared.
  const [existingCleared, setExistingCleared] = useState(false);
  const isEdit = !!certificate;
  // Show the existing attachment as an "uploaded" file until it's cleared or a
  // new file is chosen.
  const showExisting =
    !!certificate?.attachment_path && !attachment && !existingCleared;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: certificate?.name ?? "",
      organization: certificate?.organization ?? "",
      description: certificate?.description ?? "",
      date_applied: certificate?.date_applied?.split("T")[0] ?? "",
      valid_until: certificate?.valid_until?.split("T")[0] ?? "",
    },
  });

  // Valid Until is only selectable once Date Applied is set, and can't be
  // before it.
  const [dateApplied, validUntil] = useWatch({
    control,
    name: ["date_applied", "valid_until"],
  });
  useEffect(() => {
    if (validUntil && dateApplied && validUntil < dateApplied) {
      setValue("valid_until", "");
    }
  }, [dateApplied, validUntil, setValue]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      user_uuid: userUuid,
      name: data.name,
      organization: data.organization,
      description: data.description,
      date_applied: data.date_applied,
      valid_until: data.valid_until,
    };
    try {
      if (certificate) {
        await certificateApi.updateCertificate(
          certificate.uuid,
          payload,
          attachment ?? undefined
        );
        toast.success("Certificate updated successfully.");
      } else {
        await certificateApi.createCertificate(payload, attachment ?? undefined);
        toast.success("Certificate added successfully.");
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
          : `Failed to ${isEdit ? "update" : "add"} certificate. Please try again.`
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
            {isEdit ? "Edit Certificate" : "Add New Certificate"}
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
          <div className="space-y-1.5">
            <Label htmlFor="cert_name" className={FIELD_LABEL}>
              Certificate Name *
            </Label>
            <Input
              id="cert_name"
              placeholder="e.g. Certified Safety Officer"
              className={FIELD_INPUT}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-ds-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert_org" className={FIELD_LABEL}>
              Organization *
            </Label>
            <Input
              id="cert_org"
              placeholder="Issuing organization"
              className={FIELD_INPUT}
              {...register("organization")}
            />
            {errors.organization && (
              <p className="text-xs text-ds-error">
                {errors.organization.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cert_applied" className={FIELD_LABEL}>
                Date Applied *
              </Label>
              <Input
                id="cert_applied"
                type="date"
                className={FIELD_INPUT}
                {...register("date_applied")}
              />
              {errors.date_applied && (
                <p className="text-xs text-ds-error">
                  {errors.date_applied.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cert_valid" className={FIELD_LABEL}>
                Valid Until *
              </Label>
              <Input
                id="cert_valid"
                type="date"
                min={dateApplied || undefined}
                disabled={!dateApplied}
                className={`${FIELD_INPUT} disabled:cursor-not-allowed disabled:opacity-60`}
                {...register("valid_until")}
              />
              {errors.valid_until && (
                <p className="text-xs text-ds-error">
                  {errors.valid_until.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cert_desc" className={FIELD_LABEL}>
              Description
            </Label>
            <textarea
              id="cert_desc"
              rows={3}
              placeholder="Add any notes about this certificate..."
              className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={FIELD_LABEL}>Attachment</Label>
            {showExisting ? (
              // Existing attachment shown like an uploaded file, with a clear (X).
              <div className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3">
                <a
                  href={certificate!.attachment_path!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-3"
                >
                  <FileText className="h-5 w-5 shrink-0 text-ds-primary" />
                  <span className="truncate text-sm text-ds-primary">
                    {certificate!.attachment_name || "Attachment"}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => setExistingCleared(true)}
                  className="rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <ReceiptDropzone
                file={attachment}
                label="Click or drag certificate file here"
                onChange={setAttachment}
              />
            )}
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
            {isEdit ? "Save Changes" : "Add Certificate"}
          </button>
        </div>
      </form>
    </div>
  );
}
