"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { Position } from "@/types/position";

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const columns: ColumnDef<Position>[] = [
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const value = row.original.description;
      return value ? (
        <span className="line-clamp-2 break-words text-on-surface-variant">
          {value}
        </span>
      ) : (
        <span className="text-on-surface-variant">—</span>
      );
    },
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
              title="Edit position"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {meta.canDelete && (
            <button
              onClick={() => meta.onDelete?.(row.original.uuid)}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
              title="Delete position"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    },
  },
];

interface PositionTableProps {
  positions: Position[];
  isLoading: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (uuid: string) => void;
  onDelete?: (uuid: string) => void;
}

export function PositionTable({
  positions,
  isLoading,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: PositionTableProps) {
  const table = useReactTable({
    data: positions,
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

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No positions found.</p>
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
                      : header.column.id === "description"
                        ? "w-[60%] pl-4 pr-12 text-left"
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
                        : "pl-4 pr-12"
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
