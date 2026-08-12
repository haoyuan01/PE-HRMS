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
import { upcomingEventApi } from "@/lib/api/upcomingEvent";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import type { EventImage, UpcomingEvent } from "@/types/event";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";
const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string(),
    location: z.string().min(1, "Location is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string(),
    is_published: z.boolean(),
  })
  .refine(
    (d) => !d.end_date || !d.start_date || d.start_date <= d.end_date,
    { message: "End date cannot be before the start date", path: ["end_date"] }
  );

type FormValues = z.infer<typeof schema>;

interface EventFormModalProps {
  // When provided, the modal edits this event instead of creating one.
  event?: UpcomingEvent;
  onClose: () => void;
  onSaved: () => void;
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        selected
          ? "border-ds-primary bg-ds-primary/10 text-ds-primary"
          : "border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      {label}
    </button>
  );
}

export function EventFormModal({ event, onClose, onSaved }: EventFormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = !!event;

  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [offices, setOffices] = useState<LookupItem[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(
    event?.departments.map((d) => d.uuid) ?? []
  );
  const [selectedOffices, setSelectedOffices] = useState<string[]>(
    event?.offices.map((o) => o.uuid) ?? []
  );
  const [existingImages, setExistingImages] = useState<EventImage[]>(
    event?.images ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    lookupApi.getDepartments().then(setDepartments).catch(() => {});
    lookupApi.getOffices().then(setOffices).catch(() => {});
  }, []);

  // Object URLs for previewing freshly-added files (revoked on change/unmount).
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
      name: event?.name ?? "",
      description: event?.description ?? "",
      location: event?.location ?? "",
      start_date: event?.start_date?.split("T")[0] ?? "",
      end_date: event?.end_date?.split("T")[0] ?? "",
      is_published: event ? event.is_published : true,
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");
  useEffect(() => {
    if (endDate && startDate && endDate < startDate) setValue("end_date", "");
  }, [startDate, endDate, setValue]);

  // Start date can't be in the past. When editing an event that already
  // started, keep its original date selectable so it isn't flagged invalid.
  const today = new Date().toISOString().slice(0, 10);
  const existingStart = event?.start_date?.split("T")[0];
  const startMin =
    existingStart && existingStart < today ? existingStart : today;

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    uuid: string
  ) =>
    setList(
      list.includes(uuid) ? list.filter((x) => x !== uuid) : [...list, uuid]
    );

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setNewFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name,
      description: data.description,
      location: data.location,
      start_date: data.start_date,
      end_date: data.end_date,
      is_published: data.is_published,
      department_uuids: selectedDepts,
      office_uuids: selectedOffices,
    };
    try {
      if (event) {
        await upcomingEventApi.updateUpcomingEvent(
          event.uuid,
          payload,
          existingImages.map((img) => img.uuid),
          newFiles
        );
        toast.success("Event updated successfully.");
      } else {
        await upcomingEventApi.createUpcomingEvent(payload, newFiles);
        toast.success("Event created successfully.");
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
          : `Failed to ${isEdit ? "update" : "create"} event. Please try again.`
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
            {isEdit ? "Edit Event" : "New Event"}
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
            <Label htmlFor="ev_name" className={FIELD_LABEL}>
              Event Name *
            </Label>
            <Input
              id="ev_name"
              placeholder="e.g. PE Charity Run"
              className={FIELD_INPUT}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-ds-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev_desc" className={FIELD_LABEL}>
              Description
            </Label>
            <textarea
              id="ev_desc"
              rows={3}
              placeholder="Describe the event..."
              className="w-full rounded-lg border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all"
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev_location" className={FIELD_LABEL}>
              Location *
            </Label>
            <Input
              id="ev_location"
              placeholder="e.g. Stadium Miri"
              className={FIELD_INPUT}
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-ds-error">{errors.location.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ev_start" className={FIELD_LABEL}>
                Start Date *
              </Label>
              <Input
                id="ev_start"
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
              <Label htmlFor="ev_end" className={FIELD_LABEL}>
                End Date
              </Label>
              <Input
                id="ev_end"
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

          {/* Departments */}
          <div className="space-y-1.5">
            <Label className={FIELD_LABEL}>Departments</Label>
            <div className="flex flex-wrap gap-2">
              {departments.length === 0 ? (
                <span className="text-xs text-on-surface-variant">Loading…</span>
              ) : (
                departments.map((d) => (
                  <Chip
                    key={d.uuid}
                    label={d.name}
                    selected={selectedDepts.includes(d.uuid)}
                    onClick={() =>
                      toggle(selectedDepts, setSelectedDepts, d.uuid)
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* Offices */}
          <div className="space-y-1.5">
            <Label className={FIELD_LABEL}>Branch Offices</Label>
            <div className="flex flex-wrap gap-2">
              {offices.length === 0 ? (
                <span className="text-xs text-on-surface-variant">Loading…</span>
              ) : (
                offices.map((o) => (
                  <Chip
                    key={o.uuid}
                    label={o.name}
                    selected={selectedOffices.includes(o.uuid)}
                    onClick={() =>
                      toggle(selectedOffices, setSelectedOffices, o.uuid)
                    }
                  />
                ))
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
                      alt="Event image"
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
            {isEdit ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
