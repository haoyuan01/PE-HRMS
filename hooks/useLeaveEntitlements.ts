"use client";

import { useEffect, useState, useCallback } from "react";
import { leaveEntitlementApi } from "@/lib/api/leaveEntitlement";
import { leavePolicyApi } from "@/lib/api/leavePolicy";
import type { LeaveEntitlementUser } from "@/types/leave-entitlement";

export interface PolicyColumn {
  uuid: string;
  code: string;
  name: string;
}

/**
 * Loads the leave entitlement rows, filtered server-side by `search` on the
 * employee name. Policy codes drive the table's dynamic columns and never
 * change with the search, so they are fetched once rather than on every term.
 */
export function useLeaveEntitlements(search?: string) {
  const [users, setUsers] = useState<LeaveEntitlementUser[]>([]);
  const [policyColumns, setPolicyColumns] = useState<PolicyColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntitlements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const entitlements = await leaveEntitlementApi.getLeaveEntitlements(
        search ? { name: search } : undefined
      );
      setUsers(entitlements.data);
    } catch {
      setError("Failed to load leave entitlements.");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  useEffect(() => {
    let cancelled = false;
    leavePolicyApi
      .getLeavePolicies({ size: 100 })
      .then((policies) => {
        if (cancelled) return;
        setPolicyColumns(
          policies.data.map((p) => ({
            uuid: p.uuid,
            code: p.code,
            name: p.name,
          }))
        );
      })
      .catch(() => {
        // The entitlement rows still render without the policy columns; the
        // entitlement request owns the visible error state.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    users,
    policyColumns,
    isLoading,
    error,
    refetch: fetchEntitlements,
  };
}
