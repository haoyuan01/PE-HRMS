"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Camera, Pencil } from "lucide-react";
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
import { userApi } from "@/lib/api/user";
import type { UserProfile } from "@/types/user";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const FIELD_TRIGGER =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all w-full rounded-lg text-base md:text-sm h-auto";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const IDENTITY_REGEX = /^\d{6}-\d{2}-\d{4}$/;

const schema = z
  .object({
    full_name: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    personal_email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    nationality: z.enum(["malaysian", "non_malaysian"]),
    gender: z.string(),
    is_married: z.string(),
    identity_number: z.string(),
    passport_number: z.string(),
    passport_expiry_date: z.string(),
    blood_type: z.string(),
  })
  .superRefine((data, ctx) => {
    // Malaysians provide an identity number in the 12-digit IC format; when
    // filled it must match. Non-Malaysians use passport fields instead.
    if (
      data.nationality === "malaysian" &&
      data.identity_number &&
      !IDENTITY_REGEX.test(data.identity_number)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identity_number"],
        message: "Identity number must be in the format 000000-00-0000",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface PersonalTabProps {
  profile: UserProfile;
  onSaved: () => void;
}

export function PersonalTab({ profile, onSaved }: PersonalTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const personal = profile.personal;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      first_name: "",
      last_name: "",
      personal_email: "",
      nationality: "malaysian",
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
        personal_email: profile.email ?? "",
        // Preselect nationality: identity present -> Malaysian; only a passport
        // present -> Non-Malaysian; if both, default to Malaysian.
        nationality:
          personal?.identity_number
            ? "malaysian"
            : personal?.passport_number
              ? "non_malaysian"
              : "malaysian",
        gender: personal?.gender === true ? "male" : personal?.gender === false ? "female" : "",
        is_married: personal?.is_married === true ? "married" : personal?.is_married === false ? "single" : "",
        identity_number: personal?.identity_number ?? "",
        passport_number: personal?.passport_number ?? "",
        passport_expiry_date: personal?.passport_expiry_date?.split("T")[0] ?? "",
        blood_type: personal?.blood_type ?? "",
      });
    }
  }, [profile, personal, reset]);

  const nationality = useWatch({ control, name: "nationality" });
  const isMalaysian = nationality !== "non_malaysian";

  const onSubmit = async (data: FormValues) => {
    try {
      await userApi.updatePersonal(profile.uuid, {
        full_name: data.full_name,
        first_name: data.first_name,
        last_name: data.last_name,
        // Malaysians keep an identity number; others keep passport details. The
        // unused side is cleared so a hidden field doesn't linger on the record.
        identity_number: isMalaysian ? data.identity_number || null : null,
        passport_number: isMalaysian ? null : data.passport_number || null,
        passport_expiry_date: isMalaysian
          ? null
          : data.passport_expiry_date || null,
        blood_type: data.blood_type || null,
        gender: data.gender === "male" ? true : data.gender === "female" ? false : null,
        is_married: data.is_married === "married" ? true : data.is_married === "single" ? false : null,
        image: imageFile || undefined,
      });

      // The personal email is the user's login email, which lives on the user
      // record. Update it only when it changed (the endpoint also requires the
      // current role_uuid; sending no employment[...] keys leaves employment
      // untouched).
      if (data.personal_email !== profile.email) {
        await userApi.updateUser(profile.uuid, {
          email: data.personal_email,
          role_uuid: profile.roles?.[0]?.uuid ?? null,
        });
      }

      toast.success("Personal information updated successfully.");
      onSaved();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: unknown } | undefined)?.message
        : undefined;
      // Validation errors come back as { field: [msg] }; show the first.
      const text =
        message && typeof message === "object"
          ? String(Object.values(message as Record<string, string[]>)[0]?.[0] ?? "")
          : typeof message === "string"
            ? message
            : "";
      toast.error(text || "Failed to update personal information.");
    }
  };

  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    profile.email[0].toUpperCase();

  return (
    <form id="form-personal" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Profile Photo */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full bg-surface-container-high transition-all hover:ring-2 hover:ring-ds-primary/40"
          >
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
              <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
          <span
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-surface-container-lowest bg-ds-primary text-on-primary shadow-sm transition-opacity hover:opacity-90"
          >
            <Pencil className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">JPG or PNG. Max size of 800K</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              setImageUrl(URL.createObjectURL(file));
            }
          }}
        />
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

        {/* Email */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="personal_email" className={FIELD_LABEL}>
            Email *
          </Label>
          <Input
            id="personal_email"
            type="email"
            placeholder="personal@example.com"
            className={FIELD_INPUT}
            {...register("personal_email")}
          />
          {errors.personal_email && (
            <p className="text-xs text-ds-error">
              {errors.personal_email.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className={FIELD_LABEL}>Gender</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
              >
                <SelectTrigger className={FIELD_TRIGGER}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Marital Status */}
        <div className="space-y-2">
          <Label className={FIELD_LABEL}>Marital Status</Label>
          <Controller
            name="is_married"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={[
                  { value: "single", label: "Single" },
                  { value: "married", label: "Married" },
                ]}
              >
                <SelectTrigger className={FIELD_TRIGGER}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label className={FIELD_LABEL}>Nationality</Label>
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={[
                  { value: "malaysian", label: "Malaysian" },
                  { value: "non_malaysian", label: "Non-Malaysian" },
                ]}
              >
                <SelectTrigger className={FIELD_TRIGGER}>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malaysian">Malaysian</SelectItem>
                  <SelectItem value="non_malaysian">Non-Malaysian</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Identity No — Malaysians only */}
        {isMalaysian ? (
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
            {errors.identity_number && (
              <p className="text-xs text-ds-error">
                {errors.identity_number.message}
              </p>
            )}
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* Blood Type */}
        <div className="space-y-2">
          <Label className={FIELD_LABEL}>Blood Type</Label>
          <Controller
            name="blood_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={FIELD_TRIGGER}>
                  <SelectValue placeholder="Select Blood Type" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </form>
  );
}
