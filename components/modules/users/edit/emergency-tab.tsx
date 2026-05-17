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

const schema = z.object({
  name: z.string(),
  phone_number: z.string(),
  relationship: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface EmergencyTabProps {
  profile: UserProfile;
  onSaved: () => void;
}

export function EmergencyTab({ profile, onSaved }: EmergencyTabProps) {
  const emergency = profile.emergency;

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone_number: "",
      relationship: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: emergency?.name ?? "",
        phone_number: emergency?.phone_number ?? "",
        relationship: emergency?.relationship ?? "",
      });
    }
  }, [profile, emergency, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await userApi.updateEmergency(profile.uuid, {
        name: data.name || null,
        phone_number: data.phone_number || null,
        relationship: data.relationship || null,
      });
      toast.success("Emergency contact updated successfully.");
      onSaved();
    } catch {
      toast.error("Failed to update emergency contact.");
    }
  };

  return (
    <form id="form-emergency" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
      {/* Contact Name */}
      <div className="space-y-2">
        <Label htmlFor="emergency_name" className={FIELD_LABEL}>
          Contact Name
        </Label>
        <Input
          id="emergency_name"
          placeholder="Full name of emergency contact"
          className={FIELD_INPUT}
          {...register("name")}
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="emergency_phone" className={FIELD_LABEL}>
          Phone Number
        </Label>
        <Input
          id="emergency_phone"
          placeholder="+1 (555) 000-0000"
          className={FIELD_INPUT}
          {...register("phone_number")}
        />
      </div>

      {/* Relationship */}
      <div className="space-y-2">
        <Label htmlFor="emergency_relationship" className={FIELD_LABEL}>
          Relationship
        </Label>
        <div className="relative">
          <select
            id="emergency_relationship"
            className={FIELD_SELECT}
            {...register("relationship")}
          >
            <option value="" disabled hidden>Select Relationship</option>
            {RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        </div>
      </div>
    </form>
  );
}
