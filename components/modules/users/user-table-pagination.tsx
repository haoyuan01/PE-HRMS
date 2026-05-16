"use client";

import type { Pagination } from "@/types/user";

interface UserTablePaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export function UserTablePagination({
  pagination,
  onPageChange,
}: UserTablePaginationProps) {
  const { current_page, last_page, total, per_page } = pagination;
  const from = (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <p className="text-sm text-on-surface-variant">
        Showing {from} of {total} users
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {Array.from({ length: last_page }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
              page === current_page
                ? "bg-ds-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
