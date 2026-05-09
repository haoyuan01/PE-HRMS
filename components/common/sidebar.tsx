"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  CalendarOff,
  Users,
  UserCog,
  Award,
  CalendarDays,
  ArrowLeftRight,
  LogOut,
  Cloud,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "@/lib/api/auth";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { useSidebarStore } from "@/stores/useSidebarStore";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Request Form", href: "/dashboard/requests", icon: FileText },
  { label: "Leave Entitlement", href: "/dashboard/leave", icon: CalendarOff },
  { label: "User Management", href: "/dashboard/users", icon: Users },
  { label: "Account", href: "/dashboard/account", icon: UserCog },
  { label: "Certificate", href: "/dashboard/certificates", icon: Award },
  { label: "Upcoming Events", href: "/dashboard/events", icon: CalendarDays },
  {
    label: "Staff Movement",
    href: "/dashboard/staff-movement",
    icon: ArrowLeftRight,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { isCollapsed, toggle } = useSidebarStore();

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with client-side logout even if API fails
    }
    clearAuth();
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col bg-surface-container-low transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ds-primary">
          <Cloud className="h-4 w-4 text-white" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold text-on-surface">
              {APP_NAME}
            </p>
            <p className="truncate text-[11px] text-on-surface-variant">
              Ethereal Management
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ds-primary/10 text-ds-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive
                    ? "text-ds-primary"
                    : "text-on-surface-variant group-hover:text-on-surface"
                )}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-1 px-3 pb-4">
        {/* Collapse Toggle */}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 shrink-0 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
          {!isCollapsed && <span>Collapse</span>}
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-ds-error/10 hover:text-ds-error transition-colors"
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
