"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  /** Rows rendered on this page, for the "Showing N of total" summary. */
  shown: number;
  total: number;
  /** Plural noun for the summary: "users", "movements", "results". */
  label: string;
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  /**
   * Draw the top divider. On by default; pass false where the parent already
   * separates the footer from the rows above it.
   */
  divider?: boolean;
  /**
   * Also show numbered page buttons from `sm` up. They are never rendered on a
   * phone — a long page list wraps into several rows there, and "Page N of M"
   * says the same thing in one line.
   */
  showPageNumbers?: boolean;
}

/**
 * The footer under a paginated list. Mobile puts Previous and Next at opposite
 * edges with the page indicator between them, so both stay reachable under a
 * thumb; from `sm` up it collapses to the usual summary-left, controls-right
 * row. See RESPONSIVE.md.
 */
export function TablePagination({
  shown,
  total,
  label,
  currentPage,
  lastPage,
  onPageChange,
  divider = true,
  showPageNumbers = false,
}: TablePaginationProps) {
  const atStart = currentPage <= 1;
  const atEnd = currentPage >= lastPage;

  const arrow =
    "inline-flex h-10 items-center gap-1 rounded-lg border border-outline-variant/30 px-3 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:h-9";

  return (
    <div
      className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
        divider ? "border-t border-outline-variant/20" : ""
      }`}
    >
      <p className="text-center text-sm text-on-surface-variant sm:text-left">
        Showing {shown} of {total} {label}
      </p>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={atStart}
          className={arrow}
        >
          <ChevronLeft className="h-4 w-4" />
          {/* Short label on a phone so the row still fits at 320px. */}
          <span className="sm:hidden">Prev</span>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {showPageNumbers && (
          <div className="hidden items-center gap-1 sm:flex">
            {pageWindow(currentPage, lastPage).map((page, i) =>
              page === null ? (
                <span
                  key={`gap-${i}`}
                  className="px-1 text-sm text-on-surface-variant"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition-colors ${
                    page === currentPage
                      ? "bg-ds-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>
        )}

        <span
          className={`whitespace-nowrap px-1 text-sm text-on-surface-variant ${
            showPageNumbers ? "sm:hidden" : ""
          }`}
        >
          Page {currentPage} of {lastPage}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          disabled={atEnd}
          className={arrow}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Page numbers to render: always the first and last, plus the current and its
 * neighbours, with `null` standing in for an elided run. Keeps the row a fixed
 * width however many pages there are.
 */
function pageWindow(current: number, last: number): (number | null)[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const pages = new Set([1, last, current, current - 1, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= last)
    .sort((a, b) => a - b);

  const out: (number | null)[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) out.push(null);
    out.push(page);
  });
  return out;
}
