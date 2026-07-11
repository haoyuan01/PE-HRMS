"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { PermissionGroups } from "@/lib/api/permission";

const FIELD_INPUT =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all";

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

// Module keys whose displayed title differs from the humanized key.
const MODULE_TITLE_OVERRIDES: Record<string, string> = {
  role: "Permission",
  activity_log: "Audit Log",
};

// "activity_log" -> "Activity Log"
function humanizeModule(key: string) {
  if (MODULE_TITLE_OVERRIDES[key]) return MODULE_TITLE_OVERRIDES[key];
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// The action verb in a permission name. Backend naming is inconsistent — most
// are "Read Leave Policy" (action first) but some are "Leave Policy Update"
// (action last), so check both ends before falling back to the first word.
const ACTION_WORDS = ["Read", "Create", "Update", "Delete"];

function actionLabel(name: string) {
  const words = name.split(" ");
  if (ACTION_WORDS.includes(words[0])) return words[0];
  const last = words[words.length - 1];
  if (ACTION_WORDS.includes(last)) return last;
  return words[0];
}

interface PermissionFormProps {
  mode: "create" | "edit";
  groups: PermissionGroups;
  defaultName?: string;
  defaultSelected?: string[];
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: (values: { name: string; permissionUuids: string[] }) => void;
}

export function PermissionForm({
  mode,
  groups,
  defaultName = "",
  defaultSelected = [],
  isSaving = false,
  onCancel,
  onSubmit,
}: PermissionFormProps) {
  const [name, setName] = useState(defaultName);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultSelected)
  );
  const [nameError, setNameError] = useState<string | null>(null);

  const toggle = (uuid: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(uuid);
      else next.delete(uuid);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameError(null);
    onSubmit({ name: name.trim(), permissionUuids: Array.from(selected) });
  };

  const modules = Object.keys(groups);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="role-name" className={FIELD_LABEL}>
          Name *
        </Label>
        <Input
          id="role-name"
          placeholder="Enter role name"
          className={FIELD_INPUT}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {nameError && <p className="text-xs text-ds-error">{nameError}</p>}
      </div>

      {/* Permission matrix */}
      <div className="divide-y divide-outline-variant/20">
        {modules.map((moduleKey) => (
          <section key={moduleKey} className="py-5 first:pt-0">
            <h3 className="font-display text-sm font-semibold text-on-surface">
              {humanizeModule(moduleKey)}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-y-3 sm:grid-cols-4">
              {groups[moduleKey].map((permission) => {
                const checked = selected.has(permission.uuid);
                return (
                  <div key={permission.uuid} className="flex items-center gap-2">
                    <Checkbox
                      id={permission.uuid}
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggle(permission.uuid, value === true)
                      }
                      className="size-[18px] rounded border-2 border-on-surface-variant/40 data-checked:border-ds-primary data-checked:bg-ds-primary data-checked:text-white"
                    />
                    <label
                      htmlFor={permission.uuid}
                      className="cursor-pointer select-none text-sm text-on-surface"
                    >
                      {actionLabel(permission.name)}
                    </label>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

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
