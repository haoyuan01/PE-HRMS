"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * Guards a page by permission code: if the current user lacks `code`, redirect
 * to `redirectTo`. Returns whether access is allowed so the caller can avoid
 * rendering protected content while the redirect happens.
 */
export function useRequirePermission(code: string, redirectTo: string) {
  const router = useRouter();
  const { can } = usePermissions();
  const allowed = can(code);

  useEffect(() => {
    if (!allowed) router.replace(redirectTo);
  }, [allowed, redirectTo, router]);

  return allowed;
}
