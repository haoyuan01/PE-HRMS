"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, UserCog, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { authApi } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export function Topbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? (user.personal?.first_name?.[0] ?? "") + (user.personal?.last_name?.[0] ?? "")
    : "U";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    try {
      await authApi.logout();
    } catch {
      // Continue with client-side logout even if API fails
    }
    clearAuth();
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 flex h-16 items-center justify-end gap-4 border-b border-outline-variant/40 bg-surface/80 px-6 backdrop-blur-xl transition-all duration-300",
        isCollapsed ? "left-[72px]" : "left-[260px]"
      )}
    >
      {/* Notification Bell */}
      <button className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
        <Bell className="h-5 w-5" />
      </button>

      {/* User Avatar + Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ds-primary text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          {initials.toUpperCase()}
        </button>

        {/* Dropdown Menu */}
        <div
          className={cn(
            "absolute right-0 top-12 w-48 origin-top-right rounded-xl bg-surface-container-lowest py-1.5 shadow-[var(--shadow-ambient)] transition-all duration-200",
            isDropdownOpen
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          )}
        >
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              router.push("/dashboard/account");
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <UserCog className="h-4 w-4" />
            Account
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-ds-error/10 hover:text-ds-error transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
