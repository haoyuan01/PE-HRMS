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
    // If user is already authenticated (e.g. just logged in), skip session check
    if (isAuthenticated) {
      setHasHydrated(true);
      return;
    }

    // Cold page load — check if there's a valid cookie session
    async function checkSession() {
      try {
        const session = await authApi.getSession();
        if (session.authenticated) {
          if (session.user) {
            setUser(session.user);
          }
          // Cookie is valid — mark as authenticated even without user details
          // User details will be populated on next API call if needed
          if (!session.user) {
            useAuthStore.setState({ isAuthenticated: true });
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
  }, [isAuthenticated, setUser, clearAuth, setHasHydrated, router]);

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
