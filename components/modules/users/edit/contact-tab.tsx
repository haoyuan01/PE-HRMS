"use client";

import { useEffect } from "react";
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

const schema = z.object({
  phone_number: z.string(),
  personal_email: z.string(),
  company_email: z.string(),
  address_1: z.string(),
  address_2: z.string(),
  address_3: z.string(),
  city: z.string(),
  postcode: z.string(),
  state: z.string(),
  country: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface ContactTabProps {
  profile: UserProfile;
  onSaved: () => void;
}

export function ContactTab({ profile, onSaved }: ContactTabProps) {
  const contact = profile.contact;

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone_number: "",
      personal_email: "",
      company_email: "",
      address_1: "",
      address_2: "",
      address_3: "",
      city: "",
      postcode: "",
      state: "",
      country: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        phone_number: contact?.phone_number ?? "",
        personal_email: profile.email ?? "",
        company_email: contact?.company_email ?? "",
        address_1: contact?.address_1 ?? "",
        address_2: contact?.address_2 ?? "",
        address_3: contact?.address_3 ?? "",
        city: contact?.city ?? "",
        postcode: contact?.postcode ?? "",
        state: contact?.state ?? "",
        country: contact?.country ?? "",
      });
    }
  }, [profile, contact, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await userApi.updateContact(profile.uuid, {
        company_email: data.company_email || null,
        phone_number: data.phone_number || null,
        address_1: data.address_1 || null,
        address_2: data.address_2 || null,
        address_3: data.address_3 || null,
        city: data.city || null,
        state: data.state || null,
        postcode: data.postcode || null,
        country: data.country || null,
      });
      toast.success("Contact information updated successfully.");
      onSaved();
    } catch {
      toast.error("Failed to update contact information.");
    }
  };

  return (
    <form id="form-contact" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
      {/* Contact Number */}
      <div className="space-y-2">
        <Label htmlFor="phone_number" className={FIELD_LABEL}>
          Contact Number
        </Label>
        <Input
          id="phone_number"
          placeholder="+1 (555) 000-0000"
          className={FIELD_INPUT}
          {...register("phone_number")}
        />
      </div>

      {/* Personal Email */}
      <div className="space-y-2">
        <Label htmlFor="personal_email" className={FIELD_LABEL}>
          Personal Email
        </Label>
        <Input
          id="personal_email"
          type="email"
          placeholder="personal@example.com"
          className={FIELD_INPUT}
          {...register("personal_email")}
        />
      </div>

      {/* Company Email */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="company_email" className={FIELD_LABEL}>
          Company Email
        </Label>
        <Input
          id="company_email"
          type="email"
          placeholder="name@corporate.com"
          className={FIELD_INPUT}
          {...register("company_email")}
        />
      </div>

      {/* Address Line 1 */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address_1" className={FIELD_LABEL}>
          Address (Line 1)
        </Label>
        <Input
          id="address_1"
          placeholder="Street name and number"
          className={FIELD_INPUT}
          {...register("address_1")}
        />
      </div>

      {/* Address Line 2 */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address_2" className={FIELD_LABEL}>
          Address (Line 2)
        </Label>
        <Input
          id="address_2"
          placeholder="Apartment, suite, unit, building, floor, etc."
          className={FIELD_INPUT}
          {...register("address_2")}
        />
      </div>

      {/* Address Line 3 */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address_3" className={FIELD_LABEL}>
          Address (Line 3)
        </Label>
        <Input
          id="address_3"
          placeholder="Additional details"
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
          placeholder="State/Province"
          className={FIELD_INPUT}
          {...register("state")}
        />
      </div>

      {/* Country */}
      <div className="space-y-2">
        <Label htmlFor="country" className={FIELD_LABEL}>
          Country
        </Label>
        <div className="relative">
          <select id="country" className={FIELD_SELECT} {...register("country")}>
            <option value="" disabled hidden>Select Country</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Singapore">Singapore</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Brunei">Brunei</option>
            <option value="Thailand">Thailand</option>
            <option value="Philippines">Philippines</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        </div>
      </div>
    </form>
  );
}
