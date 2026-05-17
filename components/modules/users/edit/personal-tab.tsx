"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userApi } from "@/lib/api/user";
import type { UserProfile } from "@/types/user";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const FIELD_SELECT =
  "border-0 bg-surface-container-low px-4 py-1.5 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all h-8 w-full min-w-0 rounded-lg pr-10 text-base appearance-none md:text-sm";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const schema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.string(),
  is_married: z.string(),
  identity_number: z.string(),
  passport_number: z.string(),
  passport_expiry_date: z.string(),
  blood_type: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface PersonalTabProps {
  profile: UserProfile;
  onSaved: () => void;
}

export function PersonalTab({ profile, onSaved }: PersonalTabProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const personal = profile.personal;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      first_name: "",
      last_name: "",
      gender: "",
      is_married: "",
      identity_number: "",
      passport_number: "",
      passport_expiry_date: "",
      blood_type: "",
    },
  });

  useEffect(() => {
    if (profile) {
      setImageUrl(personal?.image_path ?? null);
      reset({
        full_name: personal?.full_name ?? "",
        first_name: personal?.first_name ?? "",
        last_name: personal?.last_name ?? "",
        gender: personal?.gender === true ? "male" : personal?.gender === false ? "female" : "",
        is_married: personal?.is_married === true ? "married" : personal?.is_married === false ? "single" : "",
        identity_number: personal?.identity_number ?? "",
        passport_number: personal?.passport_number ?? "",
        passport_expiry_date: personal?.passport_expiry_date?.split("T")[0] ?? "",
        blood_type: personal?.blood_type ?? "",
      });
    }
  }, [profile, personal, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await userApi.updatePersonal(profile.uuid, {
        full_name: data.full_name,
        first_name: data.first_name,
        last_name: data.last_name,
        identity_number: data.identity_number || null,
        passport_number: data.passport_number || null,
        passport_expiry_date: data.passport_expiry_date || null,
        blood_type: data.blood_type || null,
        gender: data.gender === "male" ? true : data.gender === "female" ? false : null,
        is_married: data.is_married === "married" ? true : data.is_married === "single" ? false : null,
      });
      toast.success("Personal information updated successfully.");
      onSaved();
    } catch {
      toast.error("Failed to update personal information.");
    }
  };

  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    profile.email[0].toUpperCase();

  return (
    <form id="form-personal" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Profile Photo */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-surface-container-high">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-medium text-on-surface-variant">
              {initials}
            </span>
          )}
        </div>
        <p className="text-sm text-on-surface-variant">Profile Photo</p>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        {/* Full Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="full_name" className={FIELD_LABEL}>
            Full Name
          </Label>
          <Input
            id="full_name"
            placeholder="Enter full name"
            className={FIELD_INPUT}
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-xs text-ds-error">{errors.full_name.message}</p>
          )}
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name" className={FIELD_LABEL}>
            First Name
          </Label>
          <Input
            id="first_name"
            placeholder="First name"
            className={FIELD_INPUT}
            {...register("first_name")}
          />
          {errors.first_name && (
            <p className="text-xs text-ds-error">{errors.first_name.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name" className={FIELD_LABEL}>
            Last Name
          </Label>
          <Input
            id="last_name"
            placeholder="Last name"
            className={FIELD_INPUT}
            {...register("last_name")}
          />
          {errors.last_name && (
            <p className="text-xs text-ds-error">{errors.last_name.message}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender" className={FIELD_LABEL}>
            Gender
          </Label>
          <div className="relative">
            <select id="gender" className={FIELD_SELECT} {...register("gender")}>
              <option value="" disabled hidden>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          </div>
        </div>

        {/* Marital Status */}
        <div className="space-y-2">
          <Label htmlFor="is_married" className={FIELD_LABEL}>
            Marital Status
          </Label>
          <div className="relative">
            <select id="is_married" className={FIELD_SELECT} {...register("is_married")}>
              <option value="" disabled hidden>Select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          </div>
        </div>

        {/* Identity No */}
        <div className="space-y-2">
          <Label htmlFor="identity_number" className={FIELD_LABEL}>
            Identity No.
          </Label>
          <Input
            id="identity_number"
            placeholder="e.g. 880210-01-2233"
            className={FIELD_INPUT}
            {...register("identity_number")}
          />
        </div>

        {/* Passport No */}
        <div className="space-y-2">
          <Label htmlFor="passport_number" className={FIELD_LABEL}>
            Passport No.
          </Label>
          <Input
            id="passport_number"
            placeholder="e.g. A12345678"
            className={FIELD_INPUT}
            {...register("passport_number")}
          />
        </div>

        {/* Passport Expiry Date */}
        <div className="space-y-2">
          <Label htmlFor="passport_expiry_date" className={FIELD_LABEL}>
            Passport Expiry Date
          </Label>
          <Input
            id="passport_expiry_date"
            type="date"
            className={FIELD_INPUT}
            {...register("passport_expiry_date")}
          />
        </div>

        {/* Blood Type */}
        <div className="space-y-2">
          <Label htmlFor="blood_type" className={FIELD_LABEL}>
            Blood Type
          </Label>
          <div className="relative">
            <select id="blood_type" className={FIELD_SELECT} {...register("blood_type")}>
              <option value="" disabled hidden>Select Blood Type</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          </div>
        </div>
      </div>
    </form>
  );
}
