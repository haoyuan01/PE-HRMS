"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import {
  RecordCard,
  RecordCardField,
  RecordCardFields,
} from "@/components/common/record-card";
import type { LeavePolicy } from "@/types/leave-policy";

function YesNo({ value }: { value: boolean }) {
  return <span className="text-on-surface">{value ? "Yes" : "No"}</span>;
}

const columns: ColumnDef<LeavePolicy>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium text-on-surface">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="text-on-surface-variant">{row.original.code}</span>
    ),
  },
  {
    id: "allow_half_day",
    header: "Allow Half Day",
    cell: ({ row }) => <YesNo value={row.original.allow_half_day} />,
  },
  {
    id: "carry_forward",
    header: "Carry Forward",
    // Carry forward is enabled when the policy allows any carry-forward days.
    cell: ({ row }) => <YesNo value={Number(row.original.carry_forward_days) > 0} />,
  },
  {
    id: "min_notice_days",
    header: "Min Notice Days",
    cell: ({ row }) => (
      <span className="text-on-surface">{Number(row.original.min_notice_days)}</span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        canEdit?: boolean;
        canDelete?: boolean;
        onEdit?: (policy: LeavePolicy) => void;
        onDelete?: (policy: LeavePolicy) => void;
      };
      return (
        <div className="flex items-center justify-end gap-1">
          {meta.canEdit && (
            <button
              onClick={() => meta.onEdit?.(row.original)}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              title="Edit leave policy"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {meta.canDelete && (
            <button
              onClick={() => meta.onDelete?.(row.original)}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
              title="Delete leave policy"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    },
  },
];

// Mobile stand-in for one leave policy row — see RESPONSIVE.md. The policy code
// takes the status slot as a neutral chip: it is the at-a-glance identifier.
function LeavePolicyCard({
  policy: p,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  policy: LeavePolicy;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <RecordCard
      title={<p className="truncate font-medium text-on-surface">{p.name}</p>}
      status={
        <span className="inline-flex shrink-0 rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          {p.code}
        </span>
      }
      action={
        canEdit || canDelete ? (
          <>
            {canEdit && (
              <button
                onClick={onEdit}
                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                title="Edit leave policy"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                title="Delete leave policy"
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
          label="Allow Half Day"
          value={p.allow_half_day ? "Yes" : "No"}
        />
        <RecordCardField
          label="Carry Forward"
          value={Number(p.carry_forward_days) > 0 ? "Yes" : "No"}
        />
        <RecordCardField
          label="Min Notice Days"
          value={String(Number(p.min_notice_days))}
          wide
        />
      </RecordCardFields>
    </RecordCard>
  );
}

interface LeavePolicyTableProps {
  policies: LeavePolicy[];
  isLoading: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (policy: LeavePolicy) => void;
  onDelete?: (policy: LeavePolicy) => void;
}

export function LeavePolicyTable({
  policies,
  isLoading,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: LeavePolicyTableProps) {
  const table = useReactTable({
    data: policies,
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

  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No leave policies found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Card list — phones and small tablets */}
      <div className="space-y-3 p-4 md:hidden">
        {policies.map((p) => (
          <LeavePolicyCard
            key={p.uuid}
            policy={p}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={() => onEdit?.(p)}
            onDelete={() => onDelete?.(p)}
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
                      ? "w-[26%] pl-12 pr-4 text-left"
                      : header.column.id === "actions"
                        ? "w-[12%] pl-4 pr-12 text-right"
                        : "px-4 text-left"
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
