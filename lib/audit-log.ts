import type { ActivityLog } from "@/types/activity-log";

// Fields that change on almost every record and aren't meaningful to show.
const IGNORED_FIELDS = new Set(["updated_at", "created_at"]);

export interface FieldChange {
  field: string;
  oldValue: string;
  newValue: string;
}

function humanizeField(key: string) {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function getFieldChanges(
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null
): FieldChange[] {
  const oldV = oldValues ?? {};
  const newV = newValues ?? {};
  const keys = Array.from(
    new Set([...Object.keys(oldV), ...Object.keys(newV)])
  ).filter((key) => !IGNORED_FIELDS.has(key));

  return keys.map((field) => ({
    field: humanizeField(field),
    oldValue: displayValue(oldV[field]),
    newValue: displayValue(newV[field]),
  }));
}

// Whether a log has any meaningful change worth listing. "updated" events that
// only touched timestamps (no real field change) are treated as noise.
export function hasMeaningfulChange(log: ActivityLog): boolean {
  if (log.event !== "updated") return true;
  return getFieldChanges(log.old_values, log.new_values).length > 0;
}
