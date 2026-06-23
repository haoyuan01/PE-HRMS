"use client";

import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Access the current user's permission codes (e.g. "role_read") and a helper
 * to check for one. Codes come from the cookie session populated at login.
 */
export function usePermissions() {
  const permissions = useAuthStore((s) => s.permissions);
  const can = (code: string) => permissions.includes(code);
  return { permissions, can };
}
