"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const FIELD_TRIGGER =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all w-full rounded-lg text-base md:text-sm h-auto";

const COUNTRIES = [
  "Malaysia",
  "Singapore",
  "Indonesia",
  "Brunei",
  "Thailand",
  "Philippines",
];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_number: z.string(),
  fax_number: z.string(),
  email: z
    .string()
    .refine(
      (v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
      "Invalid email address"
    ),
  address_1: z.string(),
  address_2: z.string(),
  address_3: z.string(),
  city: z.string(),
  state: z.string(),
  postcode: z.string(),
  country: z.string(),
  description: z.string(),
});

export type BranchFormValues = z.infer<typeof schema>;

export const EMPTY_BRANCH: BranchFormValues = {
  name: "",
  phone_number: "",
  fax_number: "",
  email: "",
  address_1: "",
  address_2: "",
  address_3: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  description: "",
};

interface BranchFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  defaultValues?: BranchFormValues;
  isLoadingData?: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (values: BranchFormValues) => void;
}

export function BranchFormModal({
  open,
  mode,
  defaultValues,
  isLoadingData = false,
  isSaving = false,
  onClose,
  onSubmit,
}: BranchFormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_BRANCH,
  });

  // Sync the form when the modal opens and whenever fresh data arrives (edit
  // prefill is fetched asynchronously).
  useEffect(() => {
    if (open) {
      reset(defaultValues ?? EMPTY_BRANCH);
    }
  }, [open, defaultValues, reset]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="font-display text-lg font-bold text-on-surface">
            {mode === "create" ? "New Branch Office" : "Edit Branch Office"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center gap-2 py-20">
            <Loader2 className="h-5 w-5 animate-spin text-on-surface-variant" />
            <span className="text-sm text-on-surface-variant">Loading...</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branch-name" className={FIELD_LABEL}>
                  Name *
                </Label>
                <Input
                  id="branch-name"
                  placeholder="Enter branch name"
                  className={FIELD_INPUT}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-ds-error">{errors.name.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="branch-phone" className={FIELD_LABEL}>
                  Phone Number
                </Label>
                <Input
                  id="branch-phone"
                  placeholder="+60..."
                  className={FIELD_INPUT}
                  {...register("phone_number")}
                />
              </div>

              {/* Fax Number */}
              <div className="space-y-2">
                <Label htmlFor="branch-fax" className={FIELD_LABEL}>
                  Fax Number
                </Label>
                <Input
                  id="branch-fax"
                  placeholder="+60..."
                  className={FIELD_INPUT}
                  {...register("fax_number")}
                />
              </div>

              {/* Email */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branch-email" className={FIELD_LABEL}>
                  Email
                </Label>
                <Input
                  id="branch-email"
                  type="email"
                  placeholder="branch@example.com"
                  className={FIELD_INPUT}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-ds-error">{errors.email.message}</p>
                )}
              </div>

              {/* Address Line 1 */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branch-address1" className={FIELD_LABEL}>
                  Address Line 1
                </Label>
                <Input
                  id="branch-address1"
                  placeholder="Street address"
                  className={FIELD_INPUT}
                  {...register("address_1")}
                />
              </div>

              {/* Address Line 2 */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branch-address2" className={FIELD_LABEL}>
                  Address Line 2
                </Label>
                <Input
                  id="branch-address2"
                  placeholder="Suite, unit, etc."
                  className={FIELD_INPUT}
                  {...register("address_2")}
                />
              </div>

              {/* Address Line 3 */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branch-address3" className={FIELD_LABEL}>
                  Address Line 3
                </Label>
                <Input
                  id="branch-address3"
                  placeholder="Locality"
                  className={FIELD_INPUT}
                  {...register("address_3")}
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="branch-city" className={FIELD_LABEL}>
                  City
                </Label>
                <Input
                  id="branch-city"
                  placeholder="City"
                  className={FIELD_INPUT}
                  {...register("city")}
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="branch-state" className={FIELD_LABEL}>
                  State
                </Label>
                <Input
                  id="branch-state"
                  placeholder="State"
                  className={FIELD_INPUT}
                  {...register("state")}
                />
              </div>

              {/* Postcode */}
              <div className="space-y-2">
                <Label htmlFor="branch-postcode" className={FIELD_LABEL}>
                  Postcode
                </Label>
                <Input
                  id="branch-postcode"
                  placeholder="Postcode"
                  className={FIELD_INPUT}
                  {...register("postcode")}
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label className={FIELD_LABEL}>Country</Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={FIELD_TRIGGER}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c} label={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Description */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branch-description" className={FIELD_LABEL}>
                  Description
                </Label>
                <textarea
                  id="branch-description"
                  rows={3}
                  placeholder="Notes about this branch..."
                  className={`w-full rounded-lg text-sm md:text-sm ${FIELD_INPUT} resize-none focus-visible:outline-none`}
                  {...register("description")}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-outline-variant/20 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-2.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : mode === "create" ? (
                  "Create"
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
