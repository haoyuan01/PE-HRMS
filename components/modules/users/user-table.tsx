"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import type { UserProfile } from "@/types/user";

function UserAvatar({
  user,
}: {
  user: UserProfile;
}) {
  const firstName = user.personal?.first_name;
  const lastName = user.personal?.last_name;
  const imagePath = user.personal?.image_path;
  const initials =
    (firstName?.[0] ?? "") + (lastName?.[0] ?? "") || user.email[0].toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-container-high">
        {imagePath ? (
          <Image
            src={imagePath}
            alt={`${firstName ?? ""} ${lastName ?? ""}`}
            fill
            className="object-cover"
            sizes="32px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-medium text-on-surface-variant">
            {initials}
          </span>
        )}
      </div>
      <span className="font-medium text-on-surface">
        {user.personal?.full_name ??
          ([firstName, lastName].filter(Boolean).join(" ") ||
          user.email.split("@")[0])}
      </span>
    </div>
  );
}

const columns: ColumnDef<UserProfile>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <UserAvatar user={row.original} />,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-on-surface-variant">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => (
      <span className="text-on-surface-variant">
        {row.original.employment?.position?.name ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <span className="text-on-surface-variant">
        {row.original.employment?.department?.name ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "office",
    header: "Office Branch",
    cell: ({ row }) => (
      <span className="text-on-surface-variant">
        {row.original.employment?.office?.name ?? "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          title="Edit user"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
          title="Delete user"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];

interface UserTableProps {
  users: UserProfile[];
  isLoading: boolean;
}

export function UserTable({ users, isLoading }: UserTableProps) {
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.uuid,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-surface-container-low"
          />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No users found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
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
                <td key={cell.id} className="px-4 py-3 text-sm">
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
