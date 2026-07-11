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

export function useLeaveEntitlements() {
  const [users, setUsers] = useState<LeaveEntitlementUser[]>([]);
  const [policyColumns, setPolicyColumns] = useState<PolicyColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Policy codes drive the table's dynamic columns (after "User").
      const [entitlements, policies] = await Promise.all([
        leaveEntitlementApi.getLeaveEntitlements(),
        leavePolicyApi.getLeavePolicies({ size: 100 }),
      ]);
      setUsers(entitlements.data);
      setPolicyColumns(
        policies.data.map((p) => ({ uuid: p.uuid, code: p.code, name: p.name }))
      );
    } catch {
      setError("Failed to load leave entitlements.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { users, policyColumns, isLoading, error, refetch: fetch };
}
