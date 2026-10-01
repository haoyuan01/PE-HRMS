"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import {
  RecordCard,
  RecordCardField,
  RecordCardFields,
} from "@/components/common/record-card";
import type { LeaveRequest } from "@/types/leave-request";

function formatDate(value: string | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
}

// Start/end come from the earliest/latest leave_request_dates entry.
function leaveDateBounds(r: LeaveRequest) {
  const dates = (r.leave_request_dates ?? [])
    .map((d) => d.date)
    .filter(Boolean)
    .sort();
  return { start: dates[0] ?? null, end: dates[dates.length - 1] ?? null };
}

// Approval state derived from the handover/manager/director action flags. A
// handover person who acted but didn't approve rejects the request; approving
// it just keeps the request pending for the manager/director.
function requestStatus(r: LeaveRequest) {
  const handoverRejected =
    !!r.handover_by && !!r.handover_action_at && !r.handover_approved;
  const rejected =
    handoverRejected ||
    (r.manager_action_at && !r.manager_approved) ||
    (r.director_action_at && !r.director_approved);
  if (rejected)
    return { label: "Rejected", className: "bg-ds-error/10 text-ds-error" };
  if (r.manager_approved && r.director_approved)
    return { label: "Approved", className: "bg-emerald-500/10 text-emerald-600" };
  return { label: "Pending", className: "bg-amber-500/10 text-amber-600" };
}

function StaffCell({
  user,
  align = "center",
}: {
  user: LeaveRequest["user"];
  // Table cells centre their content; the mobile card aligns to the start and
  // lets the name truncate against the status pill.
  align?: "center" | "start";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const personal = user.personal;
  const name = personal?.full_name ?? user.email;
  const image = personal?.image_path;
  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    (user.email[0]?.toUpperCase() ?? "?");

  return (
    <div
      className={`flex items-center gap-3 ${
        align === "start" ? "min-w-0 flex-1" : "justify-center"
      }`}
    >
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

const dateCols: ColumnDef<LeaveRequest>[] = [
  {
    id: "start_date",
    header: "Start Date",
    cell: ({ row }) => (
      <span className="text-on-surface">
        {formatDate(leaveDateBounds(row.original).start)}
      </span>
    ),
  },
  {
    id: "end_date",
    header: "End Date",
    cell: ({ row }) => (
      <span className="text-on-surface">
        {formatDate(leaveDateBounds(row.original).end)}
      </span>
    ),
  },
  {
    id: "resume_date",
    header: "Date of Resume",
    cell: ({ row }) => (
      <span className="text-on-surface">{formatDate(row.original.resume_date)}</span>
    ),
  },
];

// Mobile presentation of a single request. Six columns cannot be read at phone
// width, so each row becomes a tappable card carrying the same fields — the
// staff name on the staff list, the leave type on the user's own list.
function LeaveRequestCard({
  request,
  showStaff,
  onView,
}: {
  request: LeaveRequest;
  showStaff?: boolean;
  onView?: (request: LeaveRequest) => void;
}) {
  const status = requestStatus(request);
  const { start, end } = leaveDateBounds(request);
  const leaveType = request.leave_entitlement?.leave_policy?.name ?? "—";

  return (
    <RecordCard
      onClick={() => onView?.(request)}
      title={
        showStaff ? (
          <StaffCell user={request.user} align="start" />
        ) : (
          <p className="truncate font-medium text-on-surface">{leaveType}</p>
        )
      }
      status={
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${status.className}`}
        >
          {status.label}
        </span>
      }
      action={
        <>
          <Eye className="h-4 w-4" />
          View Details
        </>
      }
    >
      <RecordCardFields>
        <RecordCardField label="Start Date" value={formatDate(start)} />
        <RecordCardField label="End Date" value={formatDate(end)} />
        {/* Resume spans the row so the tiles stay a balanced block. */}
        <RecordCardField
          label="Date of Resume"
          value={formatDate(request.resume_date)}
          wide
        />
      </RecordCardFields>
    </RecordCard>
  );
}

interface LeaveRequestTableProps {
  requests: LeaveRequest[];
  isLoading: boolean;
  showStaff?: boolean;
  onView?: (request: LeaveRequest) => void;
}

export function LeaveRequestTable({
  requests,
  isLoading,
  showStaff,
  onView,
}: LeaveRequestTableProps) {
  const columns = useMemo<ColumnDef<LeaveRequest>[]>(() => {
    const staffCol: ColumnDef<LeaveRequest> = {
      id: "staff",
      header: "Staff Name",
      cell: ({ row }) => <StaffCell user={row.original.user} />,
    };
    const leaveTypeCol: ColumnDef<LeaveRequest> = {
      id: "leave_type",
      header: "Leave Type",
      cell: ({ row }) => (
        <span className="text-on-surface">
          {row.original.leave_entitlement?.leave_policy?.name ?? "—"}
        </span>
      ),
    };
    const statusCol: ColumnDef<LeaveRequest> = {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = requestStatus(row.original);
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </span>
        );
      },
    };
    const actionsCol: ColumnDef<LeaveRequest> = {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const meta = table.options.meta as {
          onView?: (r: LeaveRequest) => void;
        };
        return (
          <button
            onClick={() => meta.onView?.(row.original)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
        );
      },
    };

    return [
      ...(showStaff ? [staffCol] : []),
      ...dateCols,
      ...(showStaff ? [] : [leaveTypeCol]),
      statusCol,
      actionsCol,
    ];
  }, [showStaff]);

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.uuid,
    meta: { onView },
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

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No leave requests found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Card list — phones and small tablets */}
      <div className="space-y-3 p-4 md:hidden">
        {requests.map((request) => (
          <LeaveRequestCard
            key={request.uuid}
            request={request}
            showStaff={showStaff}
            onView={onView}
          />
        ))}
      </div>

      {/* Table — md and up, where the columns still fit */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-outline-variant/20">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                  >
                    {flexRender(
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
                  <td key={cell.id} className="px-4 py-3 text-center text-sm">
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
