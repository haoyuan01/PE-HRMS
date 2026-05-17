"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountAvatar } from "@/components/modules/account/account-avatar";
import { userApi } from "@/lib/api/user";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import type { UserProfile } from "@/types/user";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const FIELD_SELECT =
  "border-0 bg-surface-container-low px-4 py-1.5 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all h-8 w-full min-w-0 rounded-lg pr-10 text-base appearance-none md:text-sm";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  identity_number: z.string(),
  passport_number: z.string(),
  blood_type: z.string(),
  gender: z.string(),
  phone_number: z.string(),
  company_email: z.string(),
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

type ProfileFormValues = z.infer<typeof profileSchema>;

interface PersonalInformationFormProps {
  profile: UserProfile | null;
  onSaved: () => void;
}

export function PersonalInformationForm({
  profile,
  onSaved,
}: PersonalInformationFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [offices, setOffices] = useState<LookupItem[]>([]);
  const [positions, setPositions] = useState<LookupItem[]>([]);

  useEffect(() => {
    lookupApi.getDepartments().then(setDepartments).catch(() => {});
    lookupApi.getOffices().then(setOffices).catch(() => {});
    lookupApi.getPositions().then(setPositions).catch(() => {});
  }, []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      first_name: "",
      last_name: "",
      identity_number: "",
      passport_number: "",
      blood_type: "",
      gender: "",
      phone_number: "",
      company_email: "",
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

  useEffect(() => {
    if (profile) {
      const personal = profile.personal;
      const contact = profile.contact;
      const employment = profile.employment;
      const emergency = profile.emergency;

      reset({
        full_name: personal?.full_name ?? "",
        first_name: personal?.first_name ?? "",
        last_name: personal?.last_name ?? "",
        identity_number: personal?.identity_number ?? "",
        passport_number: personal?.passport_number ?? "",
        blood_type: personal?.blood_type ?? "",
        gender: personal?.gender === true ? "male" : personal?.gender === false ? "female" : "",
        phone_number: contact?.phone_number ?? "",
        company_email: contact?.company_email ?? "",
        address_1: contact?.address_1 ?? "",
        address_2: contact?.address_2 ?? "",
        address_3: contact?.address_3 ?? "",
        city: contact?.city ?? "",
        state: contact?.state ?? "",
        postcode: contact?.postcode ?? "",
        country: contact?.country ?? "",
        department: employment?.department?.uuid ?? "",
        office_branch: employment?.office?.uuid ?? "",
        position: employment?.position?.uuid ?? "",
        joined_date: employment?.joined_date?.split("T")[0] ?? "",
        emergency_name: emergency?.name ?? "",
        emergency_phone: emergency?.phone_number ?? "",
        emergency_relationship: emergency?.relationship ?? "",
      });
    }
  }, [profile, departments, offices, positions, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await userApi.updateProfile(profile.uuid, {
        email: profile.email,
        role_uuid: profile.roles?.[0]?.uuid ?? undefined,
        personal: {
          full_name: data.full_name,
          first_name: data.first_name,
          last_name: data.last_name,
          identity_number: data.identity_number || null,
          passport_number: data.passport_number || null,
          blood_type: data.blood_type || null,
          gender: data.gender === "male" ? true : data.gender === "female" ? false : null,
          is_married: null,
        },
        contact: {
          company_email: data.company_email || null,
          phone_number: data.phone_number || null,
          address_1: data.address_1 || null,
          address_2: data.address_2 || null,
          address_3: data.address_3 || null,
          city: data.city || null,
          state: data.state || null,
          postcode: data.postcode || null,
          country: data.country || null,
        },
        emergency: {
          name: data.emergency_name || null,
          phone_number: data.emergency_phone || null,
          relationship: data.emergency_relationship || null,
        },
      });
      toast.success("Profile updated successfully.");
      onSaved();
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
      <h2 className="font-display text-lg font-semibold text-on-surface">
        Personal Information
      </h2>

      {/* Avatar */}
      <div className="mt-6">
        <AccountAvatar
          firstName={profile?.personal?.first_name ?? null}
          lastName={profile?.personal?.last_name ?? null}
          profilePhoto={profile?.personal?.image_path ?? null}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
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
                placeholder="Enter your full name"
                className={FIELD_INPUT}
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="text-xs text-ds-error">
                  {errors.full_name.message}
                </p>
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
                <p className="text-xs text-ds-error">
                  {errors.first_name.message}
                </p>
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
                <p className="text-xs text-ds-error">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            {/* Identity Number (IC) */}
            <div className="space-y-2">
              <Label htmlFor="identity_number" className={FIELD_LABEL}>
                IC or Passport No.
              </Label>
              <Input
                id="identity_number"
                placeholder="IC / Passport number"
                className={FIELD_INPUT}
                {...register("identity_number")}
              />
            </div>

            {/* Blood Type */}
            <div className="space-y-2">
              <Label htmlFor="blood_type" className={FIELD_LABEL}>
                Blood Type
              </Label>
              <div className="relative">
                <select
                  id="blood_type"
                  className={FIELD_SELECT}
                  {...register("blood_type")}
                >
                  <option value="" disabled hidden>Select blood type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className={FIELD_LABEL}>
                Gender
              </Label>
              <div className="relative">
                <select
                  id="gender"
                  className={FIELD_SELECT}
                  {...register("gender")}
                >
                  <option value="" disabled hidden>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              </div>
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

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className={FIELD_LABEL}>
                Country
              </Label>
              <Input
                id="country"
                placeholder="Country"
                className={FIELD_INPUT}
                {...register("country")}
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
              <Label htmlFor="department" className={FIELD_LABEL}>
                Department
              </Label>
              <div className="relative">
                <select
                  id="department"
                  className={FIELD_SELECT}
                  {...register("department")}
                >
                  <option value="" disabled hidden>Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.uuid} value={dept.uuid}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              </div>
            </div>

            {/* Office Branch */}
            <div className="space-y-2">
              <Label htmlFor="office_branch" className={FIELD_LABEL}>
                Office Branch
              </Label>
              <div className="relative">
                <select
                  id="office_branch"
                  className={FIELD_SELECT}
                  {...register("office_branch")}
                >
                  <option value="" disabled hidden>Select office branch</option>
                  {offices.map((office) => (
                    <option key={office.uuid} value={office.uuid}>
                      {office.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position" className={FIELD_LABEL}>
                Position
              </Label>
              <div className="relative">
                <select
                  id="position"
                  className={FIELD_SELECT}
                  {...register("position")}
                >
                  <option value="" disabled hidden>Select position</option>
                  {positions.map((pos) => (
                    <option key={pos.uuid} value={pos.uuid}>
                      {pos.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              </div>
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="emergency_relationship" className={FIELD_LABEL}>
                Relationship with Emergency Contact
              </Label>
              <Input
                id="emergency_relationship"
                placeholder="e.g. Spouse, Parent, Sibling"
                className={FIELD_INPUT}
                {...register("emergency_relationship")}
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving || !profile}
            className="flex items-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
