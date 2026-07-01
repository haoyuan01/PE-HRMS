"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import Image from "next/image";
import type { ClaimHeader } from "@/types/claim";

function claimStatus(claim: ClaimHeader) {
  if (claim.rejected_at)
    return { label: "Rejected", className: "bg-ds-error/10 text-ds-error" };
  if (claim.paid_at)
    return { label: "Paid", className: "bg-emerald-500/10 text-emerald-600" };
  if (claim.approved_at)
    return { label: "Approved", className: "bg-ds-primary/10 text-ds-primary" };
  return { label: "Pending", className: "bg-amber-500/10 text-amber-600" };
}

function formatAmount(amount: string) {
  const value = Number(amount);
  if (Number.isNaN(value)) return `RM ${amount}`;
  return `RM ${value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ClaimantAvatar({ claim }: { claim: ClaimHeader }) {
  const personal = claim.user?.personal;
  const name = personal?.full_name ?? claim.user?.email ?? "—";
  const image = personal?.image_path;
  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    (claim.user?.email?.[0]?.toUpperCase() ?? "?");
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-container-high">
        {image && !imageFailed ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="32px"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-medium text-on-surface-variant">
            {initials}
          </span>
        )}
      </div>
      <span className="truncate font-medium text-on-surface">{name}</span>
    </div>
  );
}

const columns: ColumnDef<ClaimHeader>[] = [
  {
    id: "staff",
    header: "Staff Name",
    cell: ({ row }) => <ClaimantAvatar claim={row.original} />,
  },
  {
    accessorKey: "name",
    header: "Travel Location",
    cell: ({ row }) => (
      <span className="block truncate text-on-surface-variant">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => (
      <span className="text-on-surface">{formatAmount(row.original.total_amount)}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = claimStatus(row.original);
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onView?: (uuid: string) => void;
      };
      return (
        <div className="flex items-center justify-center">
          <button
            onClick={() => meta.onView?.(row.original.uuid)}
            className="text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
          >
            View Details
          </button>
        </div>
      );
    },
  },
];

interface ClaimTableProps {
  claims: ClaimHeader[];
  isLoading: boolean;
  onView?: (uuid: string) => void;
}

export function ClaimTable({ claims, isLoading, onView }: ClaimTableProps) {
  const table = useReactTable({
    data: claims,
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

  if (claims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No claims found.</p>
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
                  className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant ${
                    header.column.id === "name"
                      ? "w-[30%]"
                      : header.column.id === "staff"
                        ? "w-[22%]"
                        : "w-[16%]"
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
                <td key={cell.id} className="px-4 py-3 text-sm text-center">
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
