"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "@/lib/api/auth";
import { ROUTES } from "@/lib/constants";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, user, clearAuth, setHasHydrated } =
    useAuthStore();

  useEffect(() => {
    // If already authenticated with user data (e.g. just logged in), done
    if (isAuthenticated && user) {
      if (!hasHydrated) setHasHydrated(true);
      return;
    }

    // Cold page load — check if there's a valid cookie session
    async function checkSession() {
      try {
        const session = await authApi.getSession();
        if (session.authenticated) {
          if (session.user) {
            useAuthStore.getState().setUser(session.user);
          } else {
            useAuthStore.setState({ isAuthenticated: true });
          }
          if (session.permissions) {
            useAuthStore.getState().setPermissions(session.permissions);
          }
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
  }, [isAuthenticated, user, hasHydrated, clearAuth, setHasHydrated, router]);

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
