"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import {
  RecordCard,
  RecordCardField,
  RecordCardFields,
} from "@/components/common/record-card";
import type {
  LeaveEntitlementUser,
  LeaveEntitlement,
} from "@/types/leave-entitlement";

interface PolicyColumn {
  code: string;
  name: string;
}

function num(value: string): number {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

// Cell content for a policy column: remaining / total entitled days.
function entitlementCell(entitlement: LeaveEntitlement | undefined) {
  if (!entitlement) return "—";
  return `${num(entitlement.balance_days)}/${num(entitlement.entitled_days)}`;
}

function UserCell({ user }: { user: LeaveEntitlementUser }) {
  const [imageFailed, setImageFailed] = useState(false);
  const personal = user.personal;
  const name = personal?.full_name ?? user.email;
  const image = personal?.image_path;
  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    (user.email[0]?.toUpperCase() ?? "?");

  return (
    <div className="flex items-center gap-3">
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

// Mobile stand-in for one entitlement row — see RESPONSIVE.md. This table's
// columns are dynamic (one per leave policy), so the card renders one tile per
// policy; they pair up two-per-row, and an odd trailing tile spans the row.
// Tiles are labelled with the policy's full name rather than its code: the
// table's code + `title` tooltip is unreachable on a touch screen.
function LeaveEntitlementCard({
  user,
  policyColumns,
  canEdit,
  onEdit,
}: {
  user: LeaveEntitlementUser;
  policyColumns: PolicyColumn[];
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  const byCode = new Map(
    user.leave_entitlements.map((e) => [e.leave_policy.code, e])
  );
  const isOdd = policyColumns.length % 2 === 1;

  return (
    <RecordCard
      title={<UserCell user={user} />}
      action={
        canEdit ? (
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            title="Edit entitlements"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : undefined
      }
    >
      {policyColumns.length > 0 && (
        <RecordCardFields>
          {policyColumns.map((col, i) => (
            <RecordCardField
              key={col.code}
              label={col.name}
              value={entitlementCell(byCode.get(col.code))}
              wide={isOdd && i === policyColumns.length - 1}
            />
          ))}
        </RecordCardFields>
      )}
    </RecordCard>
  );
}

interface LeaveEntitlementTableProps {
  users: LeaveEntitlementUser[];
  policyColumns: PolicyColumn[];
  isLoading: boolean;
  canEdit?: boolean;
  onEdit?: (user: LeaveEntitlementUser) => void;
}

export function LeaveEntitlementTable({
  users,
  policyColumns,
  isLoading,
  canEdit,
  onEdit,
}: LeaveEntitlementTableProps) {
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

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <p className="text-sm">No leave entitlements found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Card list — phones and small tablets */}
      <div className="space-y-3 p-4 md:hidden">
        {users.map((user) => (
          <LeaveEntitlementCard
            key={user.uuid}
            user={user}
            policyColumns={policyColumns}
            canEdit={canEdit}
            onEdit={() => onEdit?.(user)}
          />
        ))}
      </div>

      {/* Table — md and up */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Staff Name
              </th>
              {policyColumns.map((col) => (
                <th
                  key={col.code}
                  title={col.name}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                >
                  {col.code}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {users.map((user) => {
              const byCode = new Map(
                user.leave_entitlements.map((e) => [e.leave_policy.code, e])
              );
              return (
                <tr
                  key={user.uuid}
                  className="transition-colors hover:bg-surface-container-low/50"
                >
                  <td className="py-3 pl-6 pr-4 text-sm">
                    <UserCell user={user} />
                  </td>
                  {policyColumns.map((col) => (
                    <td key={col.code} className="px-4 py-3 text-sm text-on-surface">
                      {entitlementCell(byCode.get(col.code))}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {canEdit && (
                        <button
                          onClick={() => onEdit?.(user)}
                          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                          title="Edit entitlements"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
