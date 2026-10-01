"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  RecordCard,
  RecordCardField,
  RecordCardFields,
} from "@/components/common/record-card";
import type { Role } from "@/types/auth";

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium text-on-surface">
        {formatName(row.original.name)}
      </span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Last Updated",
    cell: ({ row }) => {
      const value = row.original.updated_at;
      if (!value) return <span className="text-on-surface-variant">—</span>;
      const date = new Date(value);
      return (
        <div className="leading-tight">
          <p className="text-on-surface">{format(date, "MMM dd, yyyy")}</p>
          <p className="text-xs text-on-surface-variant">{format(date, "hh:mm a")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.original.is_active
            ? "bg-emerald-500/10 text-emerald-600"
            : "bg-ds-error/10 text-ds-error"
        }`}
      >
        {row.original.is_active ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        canEdit?: boolean;
        canDelete?: boolean;
        onEdit?: (uuid: string) => void;
        onDelete?: (uuid: string) => void;
      };
      return (
        <div className="flex items-center justify-end gap-2">
          {meta.canEdit && (
            <button
              onClick={() => meta.onEdit?.(row.original.uuid)}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              title="Edit permission"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {meta.canDelete && (
            <button
              onClick={() => meta.onDelete?.(row.original.uuid)}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
              title="Delete permission"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    },
  },
];

// Mobile stand-in for one permission row — see RESPONSIVE.md. The table splits
// Last Updated over two lines; a tile value is one line, so they join with a
// separator.
function RoleCard({
  role: r,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  role: Role;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const updated = r.updated_at ? new Date(r.updated_at) : null;
  return (
    <RecordCard
      title={
        <p className="truncate font-medium text-on-surface">
          {formatName(r.name)}
        </p>
      }
      status={
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            r.is_active
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-ds-error/10 text-ds-error"
          }`}
        >
          {r.is_active ? "Active" : "Inactive"}
        </span>
      }
      action={
        canEdit || canDelete ? (
          <>
            {canEdit && (
              <button
                onClick={onEdit}
                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                title="Edit permission"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                title="Delete permission"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        ) : undefined
      }
    >
      <RecordCardFields>
        <RecordCardField
          label="Last Updated"
          value={
            updated
              ? `${format(updated, "MMM dd, yyyy")} · ${format(updated, "hh:mm a")}`
              : "—"
          }
          wide
        />
      </RecordCardFields>
    </RecordCard>
  );
}

interface RoleTableProps {
  roles: Role[];
  isLoading: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (uuid: string) => void;
  onDelete?: (uuid: string) => void;
}

export function RoleTable({
  roles,
  isLoading,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: RoleTableProps) {
  const table = useReactTable({
    data: roles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.uuid,
    meta: { canEdit, canDelete, onEdit, onDelete },
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-surface-container-low"
          />
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No permissions found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Card list — phones and small tablets */}
      <div className="space-y-3 p-4 md:hidden">
        {roles.map((r) => (
          <RoleCard
            key={r.uuid}
            role={r}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={() => onEdit?.(r.uuid)}
            onDelete={() => onDelete?.(r.uuid)}
          />
        ))}
      </div>

      {/* Table — md and up */}
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full table-fixed">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-outline-variant/20">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant ${
                    header.column.id === "name"
                      ? "w-[40%] pl-12 pr-4 text-left"
                      : header.column.id === "updated_at"
                        ? "w-[28%] px-4 text-left"
                        : header.column.id === "is_active"
                          ? "w-[16%] px-4 text-left"
                          : "w-[16%] pl-4 pr-12 text-right"
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
                    cell.column.id === "name"
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
    </>
  );
}
