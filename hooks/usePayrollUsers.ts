"use client";

import { useEffect, useState, useCallback } from "react";
import { payrollApi, type PayrollUsersParams } from "@/lib/api/payroll";
import type { PayrollUser } from "@/types/payroll";

export function usePayrollUsers(params: PayrollUsersParams) {
  const [users, setUsers] = useState<PayrollUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { month, year, user_uuid, is_published } = params;

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(
        await payrollApi.getPayrollUsers({ month, year, user_uuid, is_published })
      );
    } catch {
      setError("Failed to load payslips.");
    } finally {
      setIsLoading(false);
    }
  }, [month, year, user_uuid, is_published]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { users, isLoading, error, refetch: fetch };
}
