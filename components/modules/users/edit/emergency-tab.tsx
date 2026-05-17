"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
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

  const { register, handleSubmit, reset, control } = useForm<FormValues>({
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
        <Label className={FIELD_LABEL}>Relationship</Label>
        <Controller
          name="relationship"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={FIELD_TRIGGER}>
                <SelectValue placeholder="Select Relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((rel) => (
                  <SelectItem key={rel} value={rel}>
                    {rel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </form>
  );
}
