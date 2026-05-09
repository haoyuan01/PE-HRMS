"use client";

import { Bell } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { cn } from "@/lib/utils";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  const initials = user
    ? (user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "")
    : "U";

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

      {/* User Avatar */}
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ds-primary text-xs font-semibold text-white">
        {initials.toUpperCase()}
      </div>
    </header>
  );
}
