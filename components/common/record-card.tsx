"use client";

import type { ReactNode } from "react";

interface RecordCardProps {
  /**
   * Tapping anywhere on the card fires this — the whole card is the hit area,
   * and the card renders as a `<button>`. Omit it for rows whose actions are
   * inline controls (Edit / Delete / a link): the card is then a plain `<div>`
   * and the `action` slot may hold real buttons, which a `<button>` shell
   * could not legally nest.
   */
  onClick?: () => void;
  /** Card heading: an avatar + name block, or a plain text line. */
  title: ReactNode;
  /** Status pill, pinned to the right of the heading. */
  status?: ReactNode;
  /** One line of secondary meta under the heading, e.g. an icon + location. */
  meta?: ReactNode;
  /** Field tiles — normally a `RecordCardFields` grid. */
  children?: ReactNode;
  /**
   * Footer row. With `onClick` this is a plain affordance (icon plus
   * "View Details"); without it, the real action controls.
   */
  action?: ReactNode;
}

/**
 * The mobile stand-in for one table row. Data tables compress unreadably below
 * `md`, so each row renders as one of these cards instead; the table itself is
 * hidden until `md`. Tinted card on the white panel, tiles white on the card —
 * boundaries come from the surface hierarchy, never divider lines (DESIGN.md).
 */
export function RecordCard({
  onClick,
  title,
  status,
  meta,
  children,
  action,
}: RecordCardProps) {
  const body = (
    <>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">{title}</div>
        {status}
      </div>

      {meta && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant">
          {meta}
        </div>
      )}

      {children}
    </>
  );

  const shell =
    "flex w-full flex-col gap-3 rounded-xl bg-surface-container-low p-4 text-left";

  // Whole card is the tap target.
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${shell} transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-1 focus:ring-ds-primary/30`}
      >
        {body}
        {action && (
          <span className="flex items-center justify-end gap-1.5 text-sm font-medium text-ds-primary">
            {action}
          </span>
        )}
      </button>
    );
  }

  // Static card — `action` carries the interactive controls, so no hover or
  // focus affordance on the container itself.
  return (
    <div className={shell}>
      {body}
      {action && (
        <div className="flex items-center justify-end gap-1">{action}</div>
      )}
    </div>
  );
}

/** Two-column grid holding a card's `RecordCardField` tiles. */
export function RecordCardFields({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

interface RecordCardFieldProps {
  label: string;
  value: ReactNode;
  /**
   * Span both columns. Use it for a lone or odd trailing field so the tiles
   * stay a balanced block instead of leaving dead space beside a half tile.
   */
  wide?: boolean;
}

/** One labelled value, on its own white tile so it reads as data. */
export function RecordCardField({ label, value, wide }: RecordCardFieldProps) {
  return (
    <div
      className={`min-w-0 rounded-lg bg-surface-container-lowest p-2.5 ${
        wide ? "col-span-2" : ""
      }`}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-on-surface">{value}</p>
    </div>
  );
}
