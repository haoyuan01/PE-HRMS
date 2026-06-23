"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { Office } from "@/types/office";

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function Dash() {
  return <span className="text-on-surface-variant">—</span>;
}

const columns: ColumnDef<Office>[] = [
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
    accessorKey: "phone_number",
    header: "Phone Contact",
    cell: ({ row }) =>
      row.original.phone_number ? (
        <span className="text-on-surface-variant">
          {row.original.phone_number}
        </span>
      ) : (
        <Dash />
      ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) =>
      row.original.city ? (
        <span className="text-on-surface-variant">{row.original.city}</span>
      ) : (
        <Dash />
      ),
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) =>
      row.original.state ? (
        <span className="inline-flex rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          {row.original.state}
        </span>
      ) : (
        <Dash />
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
              title="Edit branch"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {meta.canDelete && (
            <button
              onClick={() => meta.onDelete?.(row.original.uuid)}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
              title="Delete branch"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    },
  },
];

interface BranchTableProps {
  offices: Office[];
  isLoading: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (uuid: string) => void;
  onDelete?: (uuid: string) => void;
}

export function BranchTable({
  offices,
  isLoading,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: BranchTableProps) {
  const table = useReactTable({
    data: offices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.uuid,
    meta: { canEdit, canDelete, onEdit, onDelete },
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-surface-container-low"
          />
        ))}
      </div>
    );
  }

  if (offices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No branches found.</p>
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
                    header.column.id === "name"
                      ? "w-[24%] pl-12 pr-4 text-left"
                      : header.column.id === "actions"
                        ? "w-[16%] pl-4 pr-12 text-right"
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
  );
}
