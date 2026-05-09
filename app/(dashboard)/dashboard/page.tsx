"use client";

import { useAuthStore } from "@/stores/useAuthStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
        Workspace Overview
      </h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Welcome back{user?.first_name ? `, ${user.first_name}` : ""}. Here is
        what is happening with your organization today.
      </p>
    </div>
  );
}
