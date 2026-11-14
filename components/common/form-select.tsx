"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * The standard dropdown look used across the app (Create Leave, Add User,
 * filter modals, …). Use FormSelect rather than a native <select>.
 */
export const SELECT_TRIGGER =
  "border-0 bg-surface-container-low px-4 py-3 text-on-surface focus-visible:bg-surface-container-lowest focus-visible:ring-1 focus-visible:ring-ds-primary/30 transition-all w-full rounded-lg text-base md:text-sm h-auto";

export const SELECT_LABEL =
  "text-xs font-medium uppercase tracking-widest text-on-surface-variant";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Shown when value matches no option (e.g. "" before a choice is made). */
  placeholder?: string;
  /** Renders a label above the trigger. */
  label?: string;
  id?: string;
  /** Classes for the wrapper (e.g. "sm:col-span-2"). */
  className?: string;
  error?: string;
  disabled?: boolean;
}

export function FormSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  id,
  className,
  error,
  disabled,
}: FormSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label htmlFor={id} className={SELECT_LABEL}>
          {label}
        </label>
      )}
      <Select
        value={value}
        onValueChange={(v) => onChange(v == null ? "" : String(v))}
        items={options}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className={SELECT_TRIGGER}
          aria-label={label ?? placeholder}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} label={o.label}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-ds-error">{error}</p>}
    </div>
  );
}
