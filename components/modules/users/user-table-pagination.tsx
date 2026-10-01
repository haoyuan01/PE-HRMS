"use client";

import { TablePagination } from "@/components/common/table-pagination";
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
  const shown = Math.min(current_page * per_page, total) - (current_page - 1) * per_page;

  return (
    <TablePagination
      shown={shown}
      total={total}
      label="users"
      currentPage={current_page}
      lastPage={last_page}
      onPageChange={onPageChange}
      // This list kept numbered pages; they survive from `sm` up, windowed so a
      // long page count no longer wraps into several rows.
      showPageNumbers
      divider={false}
    />
  );
}
