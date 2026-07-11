"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
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
    <div className="overflow-x-auto">
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
            <th className="py-3 pl-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
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
                <td className="py-3 pl-4 pr-6 text-right">
                  {canEdit && (
                    <button
                      onClick={() => onEdit?.(user)}
                      className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                      title="Edit entitlements"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
