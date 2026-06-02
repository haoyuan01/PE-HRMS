"use client";

import { Sidebar } from "@/components/common/sidebar";
import { Topbar } from "@/components/common/topbar";
import { AuthGuard } from "@/components/common/auth-guard";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-surface">
        <Sidebar />
        <Topbar />
        <main
          className={cn(
            "pt-16 transition-all duration-300",
            isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
          )}
        >
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
