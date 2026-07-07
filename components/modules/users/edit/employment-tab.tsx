"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userApi } from "@/lib/api/user";
import { lookupApi, type LookupItem } from "@/lib/api/lookup";
import type { UserProfile } from "@/types/user";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

const FIELD_TRIGGER =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all w-full rounded-lg text-base md:text-sm h-auto";

const schema = z.object({
  role: z.string(),
  position: z.string(),
  office_branch: z.string(),
  department: z.string(),
  joined_date: z.string(),
  is_manager: z.boolean(),
  is_accountant: z.boolean(),
  is_director: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EmploymentTabProps {
  profile: UserProfile;
  onSaved: () => void;
}

export function EmploymentTab({ profile, onSaved }: EmploymentTabProps) {
  const employment = profile.employment;
  const [roles, setRoles] = useState<LookupItem[]>([]);
  const [positions, setPositions] = useState<LookupItem[]>([]);
  const [offices, setOffices] = useState<LookupItem[]>([]);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);

  useEffect(() => {
    Promise.all([
      lookupApi.getRoles().then(setRoles).catch(() => {}),
      lookupApi.getPositions().then(setPositions).catch(() => {}),
      lookupApi.getOffices().then(setOffices).catch(() => {}),
      lookupApi.getDepartments().then(setDepartments).catch(() => {}),
    ]).finally(() => setIsLoadingLookups(false));
  }, []);

  const { register, handleSubmit, reset, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "",
      position: "",
      office_branch: "",
      department: "",
      joined_date: "",
      is_manager: false,
      is_accountant: false,
      is_director: false,
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        role: profile.roles?.[0]?.uuid ?? "",
        position: employment?.position?.uuid ?? "",
        office_branch: employment?.office?.uuid ?? "",
        department: employment?.department?.uuid ?? "",
        joined_date: employment?.joined_date?.split("T")[0] ?? "",
        is_manager: employment?.is_manager ?? false,
        is_accountant: employment?.is_accountant ?? false,
        is_director: employment?.is_director ?? false,
      });
    }
  }, [profile, employment, roles, positions, offices, departments, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Everything on this tab is saved in a single write to /users/{uuid}
      // (PUT via _method): role/email plus the full employment section. The
      // dedicated /user-employments endpoint does NOT persist the manager/
      // accountant/director flags, so the employment payload has to go through
      // the user-update endpoint (same one create user uses).
      await userApi.updateUser(profile.uuid, {
        email: profile.email,
        role_uuid: data.role || (profile.roles?.[0]?.uuid ?? null),
        employment: {
          position_uuid: data.position || null,
          department_uuid: data.department || null,
          office_uuid: data.office_branch || null,
          joined_date: data.joined_date || null,
          is_manager: data.is_manager,
          is_accountant: data.is_accountant,
          is_director: data.is_director,
        },
      });
      toast.success("Employment information updated successfully.");
      onSaved();
    } catch {
      toast.error("Failed to update employment information.");
    }
  };

  if (isLoadingLookups) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-on-surface-variant">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading employment data...</span>
      </div>
    );
  }

  return (
    <form id="form-employment" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
      {/* Role */}
      <div className="space-y-2 md:col-span-2">
        <Label className={FIELD_LABEL}>Permission</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={roles.map((r) => ({
                value: r.uuid,
                label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
              }))}
            >
              <SelectTrigger className={FIELD_TRIGGER}>
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.uuid} value={role.uuid}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </SelectItem>
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
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={positions.map((p) => ({ value: p.uuid, label: p.name }))}
            >
              <SelectTrigger className={FIELD_TRIGGER}>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.uuid} value={pos.uuid}>
                    {pos.name}
                  </SelectItem>
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
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={offices.map((o) => ({ value: o.uuid, label: o.name }))}
            >
              <SelectTrigger className={FIELD_TRIGGER}>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {offices.map((office) => (
                  <SelectItem key={office.uuid} value={office.uuid}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Department */}
      <div className="space-y-2">
        <Label className={FIELD_LABEL}>Department</Label>
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={departments.map((d) => ({ value: d.uuid, label: d.name }))}
            >
              <SelectTrigger className={FIELD_TRIGGER}>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.uuid} value={dept.uuid}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
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

      {/* Roles: Manager / Accountant */}
      <div className="flex flex-col gap-4 md:col-span-2 sm:flex-row sm:gap-16">
        <Controller
          name="is_manager"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_manager"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="size-[18px] rounded border-2 border-on-surface-variant/40 data-checked:border-ds-primary data-checked:bg-ds-primary data-checked:text-white"
              />
              <label
                htmlFor="is_manager"
                className="cursor-pointer select-none text-sm text-on-surface"
              >
                Is Manager
              </label>
            </div>
          )}
        />
        <Controller
          name="is_accountant"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_accountant"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="size-[18px] rounded border-2 border-on-surface-variant/40 data-checked:border-ds-primary data-checked:bg-ds-primary data-checked:text-white"
              />
              <label
                htmlFor="is_accountant"
                className="cursor-pointer select-none text-sm text-on-surface"
              >
                Is Accountant
              </label>
            </div>
          )}
        />
        <Controller
          name="is_director"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_director"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="size-[18px] rounded border-2 border-on-surface-variant/40 data-checked:border-ds-primary data-checked:bg-ds-primary data-checked:text-white"
              />
              <label
                htmlFor="is_director"
                className="cursor-pointer select-none text-sm text-on-surface"
              >
                Is General Manager
              </label>
            </div>
          )}
        />
      </div>
    </form>
  );
}
