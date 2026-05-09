"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "@/lib/api/auth";
import { ROUTES } from "@/lib/constants";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, setUser, clearAuth, setHasHydrated } =
    useAuthStore();

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await authApi.getSession();
        if (session.authenticated && session.user) {
          setUser(session.user);
        } else {
          clearAuth();
          router.replace(ROUTES.LOGIN);
        }
      } catch {
        clearAuth();
        router.replace(ROUTES.LOGIN);
      } finally {
        setHasHydrated(true);
      }
    }

    checkSession();
  }, [setUser, clearAuth, setHasHydrated, router]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-0.5 w-48 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-ds-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
