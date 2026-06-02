"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ArrowLeft, Camera, Loader2, Pencil, UserCircle } from "lucide-react";
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
import { lookupApi, type LookupItem } from "@/lib/api/lookup";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const FIELD_TRIGGER =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all w-full rounded-lg text-base md:text-sm h-auto";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Spouse",
  "Son",
  "Daughter",
  "Friend",
  "Other",
];

const COUNTRIES = [
  "Malaysia",
  "Singapore",
  "Indonesia",
  "Brunei",
  "Thailand",
  "Philippines",
];

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role_uuid: z.string().min(1, "Role is required"),
  full_name: z.string().min(1, "Full name is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  identity_number: z.string(),
  passport_number: z.string(),
  passport_expiry_date: z.string(),
  blood_type: z.string(),
  gender: z.string(),
  is_married: z.string(),
  company_email: z.string(),
  phone_number: z.string(),
  address_1: z.string(),
  address_2: z.string(),
  address_3: z.string(),
  city: z.string(),
  state: z.string(),
  postcode: z.string(),
  country: z.string(),
  department: z.string(),
  office_branch: z.string(),
  position: z.string(),
  joined_date: z.string(),
  emergency_name: z.string(),
  emergency_phone: z.string(),
  emergency_relationship: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function AddUserPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [roles, setRoles] = useState<LookupItem[]>([]);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [offices, setOffices] = useState<LookupItem[]>([]);
  const [positions, setPositions] = useState<LookupItem[]>([]);

  useEffect(() => {
    Promise.all([
      lookupApi.getRoles().then(setRoles).catch(() => {}),
      lookupApi.getDepartments().then(setDepartments).catch(() => {}),
      lookupApi.getOffices().then(setOffices).catch(() => {}),
      lookupApi.getPositions().then(setPositions).catch(() => {}),
    ]).finally(() => setIsLoadingLookups(false));
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      role_uuid: "",
      full_name: "",
      first_name: "",
      last_name: "",
      identity_number: "",
      passport_number: "",
      passport_expiry_date: "",
      blood_type: "",
      gender: "",
      is_married: "",
      company_email: "",
      phone_number: "",
      address_1: "",
      address_2: "",
      address_3: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
      department: "",
      office_branch: "",
      position: "",
      joined_date: "",
      emergency_name: "",
      emergency_phone: "",
      emergency_relationship: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      await userApi.createUser({
        email: data.email,
        password: data.password,
        role_uuid: data.role_uuid,
        personal: {
          full_name: data.full_name,
          first_name: data.first_name,
          last_name: data.last_name,
          identity_number: data.identity_number || undefined,
          passport_number: data.passport_number || undefined,
          passport_expiry_date: data.passport_expiry_date || undefined,
          blood_type: data.blood_type || undefined,
          gender: data.gender === "male" ? true : data.gender === "female" ? false : undefined,
          is_married: data.is_married === "married" ? true : data.is_married === "single" ? false : undefined,
          image: imageFile || undefined,
        },
        contact: {
          company_email: data.company_email || undefined,
          phone_number: data.phone_number || undefined,
          address_1: data.address_1 || undefined,
          address_2: data.address_2 || undefined,
          address_3: data.address_3 || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          postcode: data.postcode || undefined,
          country: data.country || undefined,
        },
        employment: {
          position_uuid: data.position || undefined,
          department_uuid: data.department || undefined,
          office_uuid: data.office_branch || undefined,
          joined_date: data.joined_date || undefined,
        },
        emergency: {
          name: data.emergency_name || undefined,
          phone_number: data.emergency_phone || undefined,
          relationship: data.emergency_relationship || undefined,
        },
      });
      toast.success("User created successfully.");
      router.push("/dashboard/users");
    } catch {
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/users")}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            User Management
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
            Add User
          </h1>
        </div>
      </div>

      {/* Content */}
      {isLoadingLookups ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest py-20 shadow-[var(--shadow-ambient)]">
          <Loader2 className="h-5 w-5 animate-spin text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">Loading...</span>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6 md:p-8">
          {/* Profile Photo */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-surface-container-low transition-all hover:ring-2 hover:ring-ds-primary/40"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="h-12 w-12 text-on-surface-variant/40" />
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
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
              >
                {imagePreview ? "Change Photo" : "Upload Photo"}
              </button>
              <p className="mt-1.5 text-xs text-on-surface-variant">
                JPG, GIF or PNG. Max size of 800K
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
            {/* Account Information */}
            <section>
              <h3 className="font-display text-sm font-semibold text-on-surface">
                Account Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className={FIELD_LABEL}>
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    className={FIELD_INPUT}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-ds-error">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className={FIELD_LABEL}>
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    className={FIELD_INPUT}
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-ds-error">{errors.password.message}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Role *</Label>
                  <Controller
                    name="role_uuid"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={FIELD_TRIGGER}>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.uuid} value={role.uuid} label={role.name.charAt(0).toUpperCase() + role.name.slice(1)}>
                              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role_uuid && (
                    <p className="text-xs text-ds-error">{errors.role_uuid.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Basic Information */}
            <section>
              <h3 className="font-display text-sm font-semibold text-on-surface">
                Basic Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="full_name" className={FIELD_LABEL}>
                    Full Name *
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
                    First Name *
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
                    Last Name *
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

                {/* Identity Number */}
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

                {/* Passport Number */}
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
                  <Label className={FIELD_LABEL}>Blood Type</Label>
                  <Controller
                    name="blood_type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={FIELD_TRIGGER}>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Gender</Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
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
                      <Select value={field.value} onValueChange={field.onChange}>
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
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="font-display text-sm font-semibold text-on-surface">
                Contact Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone_number" className={FIELD_LABEL}>
                    Tel. No
                  </Label>
                  <Input
                    id="phone_number"
                    placeholder="Phone number"
                    className={FIELD_INPUT}
                    {...register("phone_number")}
                  />
                </div>

                {/* Company Email */}
                <div className="space-y-2">
                  <Label htmlFor="company_email" className={FIELD_LABEL}>
                    Company Email
                  </Label>
                  <Input
                    id="company_email"
                    type="email"
                    placeholder="Company email"
                    className={FIELD_INPUT}
                    {...register("company_email")}
                  />
                </div>

                {/* Address Line 1 */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_1" className={FIELD_LABEL}>
                    Address Line 1
                  </Label>
                  <Input
                    id="address_1"
                    placeholder="Street address"
                    className={FIELD_INPUT}
                    {...register("address_1")}
                  />
                </div>

                {/* Address Line 2 */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_2" className={FIELD_LABEL}>
                    Address Line 2
                  </Label>
                  <Input
                    id="address_2"
                    placeholder="Area / Neighbourhood"
                    className={FIELD_INPUT}
                    {...register("address_2")}
                  />
                </div>

                {/* Address Line 3 */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_3" className={FIELD_LABEL}>
                    Address Line 3
                  </Label>
                  <Input
                    id="address_3"
                    placeholder="Additional address info"
                    className={FIELD_INPUT}
                    {...register("address_3")}
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className={FIELD_LABEL}>
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="City"
                    className={FIELD_INPUT}
                    {...register("city")}
                  />
                </div>

                {/* Postcode */}
                <div className="space-y-2">
                  <Label htmlFor="postcode" className={FIELD_LABEL}>
                    Postcode
                  </Label>
                  <Input
                    id="postcode"
                    placeholder="Postcode"
                    className={FIELD_INPUT}
                    {...register("postcode")}
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state" className={FIELD_LABEL}>
                    State
                  </Label>
                  <Input
                    id="state"
                    placeholder="State"
                    className={FIELD_INPUT}
                    {...register("state")}
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
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Work Information */}
            <section>
              <h3 className="font-display text-sm font-semibold text-on-surface">
                Work Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                {/* Department */}
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Department</Label>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={FIELD_TRIGGER}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.uuid} value={dept.uuid} label={dept.name}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Office Branch */}
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Office Branch</Label>
                  <Controller
                    name="office_branch"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={FIELD_TRIGGER}>
                          <SelectValue placeholder="Select office branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {offices.map((office) => (
                            <SelectItem key={office.uuid} value={office.uuid} label={office.name}>{office.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Position</Label>
                  <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={FIELD_TRIGGER}>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos.uuid} value={pos.uuid} label={pos.name}>{pos.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Joined Date */}
                <div className="space-y-2">
                  <Label htmlFor="joined_date" className={FIELD_LABEL}>
                    Date of Joined
                  </Label>
                  <Input
                    id="joined_date"
                    type="date"
                    className={FIELD_INPUT}
                    {...register("joined_date")}
                  />
                </div>
              </div>
            </section>

            {/* Emergency Information */}
            <section>
              <h3 className="font-display text-sm font-semibold text-on-surface">
                Emergency Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                {/* Emergency Contact Name */}
                <div className="space-y-2">
                  <Label htmlFor="emergency_name" className={FIELD_LABEL}>
                    Name of Emergency Contact
                  </Label>
                  <Input
                    id="emergency_name"
                    placeholder="Emergency contact name"
                    className={FIELD_INPUT}
                    {...register("emergency_name")}
                  />
                </div>

                {/* Emergency Phone */}
                <div className="space-y-2">
                  <Label htmlFor="emergency_phone" className={FIELD_LABEL}>
                    Emergency Call No
                  </Label>
                  <Input
                    id="emergency_phone"
                    placeholder="Emergency phone number"
                    className={FIELD_INPUT}
                    {...register("emergency_phone")}
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-2">
                  <Label className={FIELD_LABEL}>Relationship</Label>
                  <Controller
                    name="emergency_relationship"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={FIELD_TRIGGER}>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIPS.map((rel) => (
                            <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/users")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
