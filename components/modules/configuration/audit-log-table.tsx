"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import type { ActivityLog } from "@/types/activity-log";

// "App\Models\UserContact" -> "UserContact"
export function moduleLabel(subjectType: string) {
  const parts = subjectType.split("\\");
  return parts[parts.length - 1] || subjectType;
}

const ACTION_BADGE: Record<string, string> = {
  created: "bg-emerald-500/10 text-emerald-600",
  updated: "bg-amber-500/10 text-amber-600",
  deleted: "bg-ds-error/10 text-ds-error",
};

export function ActionBadge({ event }: { event: string }) {
  const className =
    ACTION_BADGE[event.toLowerCase()] ??
    "bg-surface-container-high text-on-surface-variant";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${className}`}
    >
      {event}
    </span>
  );
}

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

const columns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const email = row.original.user?.email;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-xs font-semibold text-on-surface-variant">
            {email ? initials(email) : "?"}
          </div>
          <span className="truncate font-medium text-on-surface">
            {email ?? "System"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "event",
    header: "Action",
    cell: ({ row }) => <ActionBadge event={row.original.event} />,
  },
  {
    accessorKey: "subject_type",
    header: "Module",
    cell: ({ row }) => (
      <span className="text-on-surface-variant">
        {moduleLabel(row.original.subject_type)}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Datetime",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return (
        <div className="leading-tight">
          <p className="text-on-surface">{format(date, "MMM dd, yyyy")}</p>
          <p className="text-xs text-on-surface-variant">{format(date, "HH:mm:ss")}</p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onView?: (log: ActivityLog) => void;
      };
      return (
        <div className="flex items-center justify-end">
          <button
            onClick={() => meta.onView?.(row.original)}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];

interface AuditLogTableProps {
  logs: ActivityLog[];
  isLoading: boolean;
  onView?: (log: ActivityLog) => void;
}

export function AuditLogTable({ logs, isLoading, onView }: AuditLogTableProps) {
  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.uuid,
    meta: { onView },
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-surface-container-low"
          />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No audit logs found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-outline-variant/20">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant ${
                    header.column.id === "user"
                      ? "w-[28%] pl-12 pr-4 text-left"
                      : header.column.id === "actions"
                        ? "w-[12%] pl-4 pr-12 text-right"
                        : "w-[20%] px-4 text-left"
                  }`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="transition-colors hover:bg-surface-container-low/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`py-3 text-sm ${
                    cell.column.id === "user"
                      ? "pl-12 pr-4"
                      : cell.column.id === "actions"
                        ? "pl-4 pr-12"
                        : "px-4"
                  }`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
