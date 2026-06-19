"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

// The modules a permission can grant access to, in display order. The `key`
// is the stable identifier used in the payload; `label` is what the user sees.
export const PERMISSION_MODULES = [
  { key: "request_form", label: "Request Form" },
  { key: "leave_entitlement", label: "Leave Entitlement" },
  { key: "user_management", label: "User Management" },
  { key: "certificate", label: "Certificate" },
  { key: "upcoming_events", label: "Upcoming Events" },
  { key: "staff_movement", label: "Staff Movement" },
  { key: "announcement", label: "Announcement" },
  { key: "payslip", label: "Payslip" },
  { key: "configuration", label: "Configuration" },
] as const;

export const PERMISSION_ACTIONS = ["read", "create", "update", "delete"] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type PermissionMatrix = Record<string, Record<PermissionAction, boolean>>;

const ACTION_LABELS: Record<PermissionAction, string> = {
  read: "Read",
  create: "Create",
  update: "Update",
  delete: "Delete",
};

function emptyMatrix(): PermissionMatrix {
  return PERMISSION_MODULES.reduce<PermissionMatrix>((acc, module) => {
    acc[module.key] = { read: false, create: false, update: false, delete: false };
    return acc;
  }, {});
}

const actionSchema = z.object({
  read: z.boolean(),
  create: z.boolean(),
  update: z.boolean(),
  delete: z.boolean(),
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  permissions: z.record(z.string(), actionSchema),
});

export type PermissionFormValues = z.infer<typeof schema>;

interface PermissionFormProps {
  mode: "create" | "edit";
  defaultName?: string;
  defaultPermissions?: PermissionMatrix;
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: (values: PermissionFormValues) => void;
}

export function PermissionForm({
  mode,
  defaultName = "",
  defaultPermissions,
  isSaving = false,
  onCancel,
  onSubmit,
}: PermissionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName,
      permissions: defaultPermissions ?? emptyMatrix(),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className={FIELD_LABEL}>
          Name *
        </Label>
        <Input
          id="name"
          placeholder="Enter role name"
          className={FIELD_INPUT}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-ds-error">{errors.name.message}</p>
        )}
      </div>

      {/* Permission matrix */}
      <Controller
        name="permissions"
        control={control}
        render={({ field }) => (
          <div className="divide-y divide-outline-variant/20">
            {PERMISSION_MODULES.map((module) => (
              <section key={module.key} className="py-5 first:pt-0">
                <h3 className="font-display text-sm font-semibold text-on-surface">
                  {module.label}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-y-3 sm:grid-cols-4">
                  {PERMISSION_ACTIONS.map((action) => {
                    const id = `${module.key}-${action}`;
                    const checked = field.value?.[module.key]?.[action] ?? false;
                    return (
                      <div key={action} className="flex items-center gap-2">
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={(value) =>
                            field.onChange({
                              ...field.value,
                              [module.key]: {
                                ...field.value[module.key],
                                [action]: value === true,
                              },
                            })
                          }
                          className="size-[18px] rounded border-2 border-on-surface-variant/40 data-checked:border-ds-primary data-checked:bg-ds-primary data-checked:text-white"
                        />
                        <label
                          htmlFor={id}
                          className="cursor-pointer select-none text-sm text-on-surface"
                        >
                          {ACTION_LABELS[action]}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-6">
        <button
          type="button"
          onClick={onCancel}
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
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create"
          ) : (
            "Update"
          )}
        </button>
      </div>
    </form>
  );
}
