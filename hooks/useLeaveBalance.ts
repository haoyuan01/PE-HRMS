"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { leaveEntitlementApi } from "@/lib/api/leaveEntitlement";
import type { LeaveEntitlement } from "@/types/leave-entitlement";

export function useLeaveBalance() {
  const userUuid = useAuthStore((s) => s.user?.uuid);
  const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userUuid) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    leaveEntitlementApi
      .getLeaveEntitlements({ user_uuid: userUuid })
      .then((res) => {
        if (!active) return;
        const me =
          res.data.find((u) => u.uuid === userUuid) ?? res.data[0];
        setEntitlements(me?.leave_entitlements ?? []);
      })
      .catch(() => active && setEntitlements([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [userUuid]);

  return { entitlements, isLoading };
}
