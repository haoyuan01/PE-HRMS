"use client";

import { useState } from "react";
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
  ChevronDown,
  Wallet,
  Settings,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "@/lib/api/auth";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { useSidebarStore } from "@/stores/useSidebarStore";

interface SubNavItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: SubNavItem[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Request Form",
    href: "/dashboard/requests",
    icon: FileText,
    children: [
      { label: "Expenses Claim Form", href: "/dashboard/requests/expenses" },
      { label: "Leave Form", href: "/dashboard/requests/leave" },
      { label: "Overtime Form", href: "/dashboard/requests/overtime" },
    ],
  },
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
  { label: "Payslip", href: "/dashboard/payslip", icon: Wallet },
  {
    label: "Configuration",
    href: "/dashboard/configuration",
    icon: Settings,
    children: [
      { label: "Role", href: "/dashboard/configuration/role" },
      { label: "Position", href: "/dashboard/configuration/position" },
      { label: "Department", href: "/dashboard/configuration/department" },
      { label: "Branch Office", href: "/dashboard/configuration/branch-office" },
      { label: "System", href: "/dashboard/configuration/system" },
      { label: "Audit Log", href: "/dashboard/configuration/audit-log" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { isCollapsed, toggle } = useSidebarStore();

  // Track which parent menus are expanded
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    // Auto-expand parent if a child route is active on mount
    const expanded = new Set<string>();
    for (const item of navItems) {
      if (item.children && pathname.startsWith(item.href)) {
        expanded.add(item.href);
      }
    }
    return expanded;
  });

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) => {
      if (prev.has(href)) {
        // Closing the current one
        return new Set<string>();
      }
      // Open this one, close all others
      return new Set([href]);
    });
  };

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
      {/* Brand + Collapse Toggle */}
      <div className={cn("flex items-center px-5", isCollapsed ? "h-20 pt-2" : "h-16")}>
        {isCollapsed ? (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ds-primary">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            <button
              onClick={toggle}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant shadow-sm hover:bg-surface-container-highest hover:text-on-surface transition-all"
              title="Expand sidebar"
            >
              <Menu className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ds-primary">
                <Cloud className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold text-on-surface">
                  {APP_NAME}
                </p>
                <p className="truncate text-[11px] text-on-surface-variant">
                  Ethereal Management
                </p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant shadow-sm hover:bg-surface-container-highest hover:text-on-surface transition-all"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const hasChildren = !!item.children;
          const isExpanded = expandedMenus.has(item.href);
          const isParentActive = pathname.startsWith(item.href);
          const isActive = hasChildren
            ? false
            : item.href === "/dashboard"
              ? pathname === "/dashboard"
              : isParentActive;

          if (hasChildren) {
            return (
              <div key={item.href}>
                {/* Parent item — toggles submenu */}
                <button
                  onClick={() => {
                    toggleMenu(item.href);
                    // If collapsed, expand sidebar first
                    if (isCollapsed) {
                      useSidebarStore.getState().setCollapsed(false);
                    }
                  }}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isParentActive
                      ? "bg-ds-primary/10 text-ds-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isParentActive
                        ? "text-ds-primary"
                        : "text-on-surface-variant group-hover:text-on-surface"
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate text-left">
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>

                {/* Sub-items with animation */}
                {!isCollapsed && (
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-in-out",
                      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="mt-1 ml-4 space-y-0.5 border-l border-outline-variant/20 pl-4">
                        {item.children!.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "block rounded-md px-3 py-2 text-sm transition-colors",
                                isChildActive
                                  ? "font-semibold text-ds-primary"
                                  : "text-on-surface-variant hover:text-on-surface"
                              )}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

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
