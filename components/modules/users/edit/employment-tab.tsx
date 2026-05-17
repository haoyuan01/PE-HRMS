"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import type { UserProfile } from "@/types/user";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const FIELD_SELECT =
  "border-0 bg-surface-container-low px-4 py-1.5 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all h-8 w-full min-w-0 rounded-lg pr-10 text-base appearance-none md:text-sm";

const schema = z.object({
  position: z.string(),
  office_branch: z.string(),
  department: z.string(),
  joined_date: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface EmploymentTabProps {
  profile: UserProfile;
}

export function EmploymentTab({ profile }: EmploymentTabProps) {
  const employment = profile.employment;
  const [positions, setPositions] = useState<LookupItem[]>([]);
  const [offices, setOffices] = useState<LookupItem[]>([]);
  const [departments, setDepartments] = useState<LookupItem[]>([]);

  useEffect(() => {
    lookupApi.getPositions().then(setPositions).catch(() => {});
    lookupApi.getOffices().then(setOffices).catch(() => {});
    lookupApi.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  const { register, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      position: "",
      office_branch: "",
      department: "",
      joined_date: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        position: employment?.position?.uuid ?? "",
        office_branch: employment?.office?.uuid ?? "",
        department: employment?.department?.uuid ?? "",
        joined_date: employment?.joined_date?.split("T")[0] ?? "",
      });
    }
  }, [profile, employment, positions, offices, departments, reset]);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
      {/* Position */}
      <div className="space-y-2">
        <Label htmlFor="position" className={FIELD_LABEL}>
          Position
        </Label>
        <div className="relative">
          <select id="position" className={FIELD_SELECT} {...register("position")}>
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

      {/* Office Branch */}
      <div className="space-y-2">
        <Label htmlFor="office_branch" className={FIELD_LABEL}>
          Office Branch
        </Label>
        <div className="relative">
          <select id="office_branch" className={FIELD_SELECT} {...register("office_branch")}>
            <option value="" disabled hidden>Select Branch</option>
            {offices.map((office) => (
              <option key={office.uuid} value={office.uuid}>
                {office.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        </div>
      </div>

      {/* Department */}
      <div className="space-y-2">
        <Label htmlFor="department" className={FIELD_LABEL}>
          Department
        </Label>
        <div className="relative">
          <select id="department" className={FIELD_SELECT} {...register("department")}>
            <option value="" disabled hidden>Select Department</option>
            {departments.map((dept) => (
              <option key={dept.uuid} value={dept.uuid}>
                {dept.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        </div>
      </div>

      {/* Joined Date */}
      <div className="space-y-2">
        <Label htmlFor="joined_date" className={FIELD_LABEL}>
          Joined Date
        </Label>
        <Input
          id="joined_date"
          type="date"
          className={FIELD_INPUT}
          {...register("joined_date")}
        />
      </div>
    </div>
  );
}
