"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Loader2, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { announcementApi } from "@/lib/api/announcement";
import type { Announcement, AnnouncementImage } from "@/types/announcement";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";
const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string(),
    is_published: z.boolean(),
  })
  .refine(
    (d) => !d.end_date || !d.start_date || d.start_date <= d.end_date,
    { message: "End date cannot be before the start date", path: ["end_date"] }
  );

type FormValues = z.infer<typeof schema>;

interface AnnouncementFormModalProps {
  // When provided, the modal edits this announcement instead of creating one.
  announcement?: Announcement;
  onClose: () => void;
  onSaved: () => void;
}

export function AnnouncementFormModal({
  announcement,
  onClose,
  onSaved,
}: AnnouncementFormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = !!announcement;

  const [existingImages, setExistingImages] = useState<AnnouncementImage[]>(
    announcement?.images ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const previews = useMemo(
    () => newFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newFiles]
  );
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: announcement?.name ?? "",
      description: announcement?.description ?? "",
      start_date: announcement?.start_date?.split("T")[0] ?? "",
      end_date: announcement?.end_date?.split("T")[0] ?? "",
      is_published: announcement ? announcement.is_published : true,
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");
  useEffect(() => {
    if (endDate && startDate && endDate < startDate) setValue("end_date", "");
  }, [startDate, endDate, setValue]);

  // Start date can't be in the past. When editing one that already started,
  // keep its original date selectable so it isn't flagged invalid.
  const today = new Date().toISOString().slice(0, 10);
  const existingStart = announcement?.start_date?.split("T")[0];
  const startMin =
    existingStart && existingStart < today ? existingStart : today;

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setNewFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      is_published: data.is_published,
    };
    try {
      if (announcement) {
        await announcementApi.updateAnnouncement(
          announcement.uuid,
          payload,
          existingImages.map((img) => img.uuid),
          newFiles
        );
        toast.success("Announcement updated successfully.");
      } else {
        await announcementApi.createAnnouncement(payload, newFiles);
        toast.success("Announcement created successfully.");
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
          : `Failed to ${isEdit ? "update" : "create"} announcement. Please try again.`
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
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-on-surface">
            {isEdit ? "Edit Announcement" : "New Announcement"}
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
            <Label htmlFor="an_name" className={FIELD_LABEL}>
              Announcement Name *
            </Label>
            <Input
              id="an_name"
              placeholder="e.g. System Maintenance Notification"
              className={FIELD_INPUT}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-ds-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="an_desc" className={FIELD_LABEL}>
              Description
            </Label>
            <textarea
              id="an_desc"
              rows={4}
              placeholder="Write the announcement..."
              className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="an_start" className={FIELD_LABEL}>
                Start Date *
              </Label>
              <Input
                id="an_start"
                type="date"
                min={startMin}
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
              <Label htmlFor="an_end" className={FIELD_LABEL}>
                End Date
              </Label>
              <Input
                id="an_end"
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

          {/* Images */}
          <div className="space-y-1.5">
            <Label className={FIELD_LABEL}>Images</Label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div
                  key={img.uuid}
                  className="relative h-20 w-28 overflow-hidden rounded-lg bg-surface-container-high"
                >
                  {img.image_path && (
                    <Image
                      src={img.image_path}
                      alt="Announcement image"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setExistingImages((prev) =>
                        prev.filter((x) => x.uuid !== img.uuid)
                      )
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {previews.map((p, i) => (
                <div
                  key={p.url}
                  className="relative h-20 w-28 overflow-hidden rounded-lg bg-surface-container-high"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt="New image"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-outline-variant/40 text-on-surface-variant transition-colors hover:border-ds-primary/40 hover:text-ds-primary">
                <ImagePlus className="h-5 w-5" />
                <span className="text-[0.65rem]">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPickFiles}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Publish */}
          <label className="flex items-center gap-3 rounded-lg bg-surface-container-low px-4 py-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-outline-variant text-ds-primary focus:ring-ds-primary/30"
              {...register("is_published")}
            />
            <span className="text-sm text-on-surface">
              Publish
              <span className="ml-1 text-xs text-on-surface-variant">
                (visible to employees)
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
            {isEdit ? "Save Changes" : "Create Announcement"}
          </button>
        </div>
      </form>
    </div>
  );
}
