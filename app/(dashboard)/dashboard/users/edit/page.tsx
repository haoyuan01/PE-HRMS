"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRequirePermission } from "@/hooks/useRequirePermission";
import { PersonalTab } from "@/components/modules/users/edit/personal-tab";
import { ContactTab } from "@/components/modules/users/edit/contact-tab";
import { EmploymentTab } from "@/components/modules/users/edit/employment-tab";
import { EmergencyTab } from "@/components/modules/users/edit/emergency-tab";

const TABS = ["Personal", "Contact", "Employment", "Emergency"] as const;
type Tab = (typeof TABS)[number];

const FORM_IDS: Record<Tab, string> = {
  Personal: "form-personal",
  Contact: "form-contact",
  Employment: "form-employment",
  Emergency: "form-emergency",
};

function EditUserContent() {
  const uuid = useSearchParams().get("uuid") ?? "";
  const router = useRouter();
  const allowed = useRequirePermission("user_update", "/dashboard/users");
  const { profile, isLoading, error, refetch } = useUserProfile(uuid);
  const [activeTab, setActiveTab] = useState<Tab>("Personal");

  // Block direct URL access for users without update permission.
  if (!allowed) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/users")}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            User Management
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
            Update User
          </h1>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="h-[500px] animate-pulse rounded-2xl bg-surface-container-low" />
      ) : error ? (
        <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
          <p className="text-sm text-ds-error">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 text-sm font-medium text-ds-primary hover:text-ds-primary-dim transition-colors"
          >
            Try again
          </button>
        </div>
      ) : profile ? (
        <div className="rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
          {/* Tabs */}
          <div className="border-b border-outline-variant/20 px-4 sm:px-6">
            <nav className="flex gap-6 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative whitespace-nowrap py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "text-on-surface"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-ds-primary" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content — all tabs stay mounted to avoid re-fetching lookup APIs */}
          <div className="p-4 sm:p-6">
            <div className={activeTab === "Personal" ? "" : "hidden"}><PersonalTab profile={profile} onSaved={refetch} /></div>
            <div className={activeTab === "Contact" ? "" : "hidden"}><ContactTab profile={profile} onSaved={refetch} /></div>
            <div className={activeTab === "Employment" ? "" : "hidden"}><EmploymentTab profile={profile} onSaved={refetch} /></div>
            <div className={activeTab === "Emergency" ? "" : "hidden"}><EmergencyTab profile={profile} onSaved={refetch} /></div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-outline-variant/20 px-4 py-4 sm:px-6">
            <button
              onClick={() => router.push("/dashboard/users")}
              className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={FORM_IDS[activeTab]}
              className="rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-6 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
            >
              Update
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function EditUserPage() {
  // useSearchParams() must be inside a Suspense boundary.
  return (
    <Suspense>
      <EditUserContent />
    </Suspense>
  );
}
