"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PersonalInformationForm } from "@/components/modules/account/personal-information-form";
import { SecurityForm } from "@/components/modules/account/security-form";
import { CertificateTab } from "@/components/modules/account/certificate-tab";

const TABS = ["Personal Information", "Certificate"] as const;
type Tab = (typeof TABS)[number];

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const { profile, isLoading, error, refetch } = useUserProfile(user?.uuid);
  const [activeTab, setActiveTab] = useState<Tab>("Personal Information");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Manage Settings
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          Account
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant/20">
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

      {/* Personal Information tab */}
      <div
        className={activeTab === "Personal Information" ? "space-y-6" : "hidden"}
      >
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-[600px] animate-pulse rounded-2xl bg-surface-container-low" />
            <div className="h-48 animate-pulse rounded-2xl bg-surface-container-low" />
          </div>
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
        ) : (
          <>
            <PersonalInformationForm profile={profile} onSaved={refetch} />
            <SecurityForm userUuid={user!.uuid} />
          </>
        )}
      </div>

      {/* Certificate tab */}
      <div className={activeTab === "Certificate" ? "" : "hidden"}>
        {user && <CertificateTab userUuid={user.uuid} />}
      </div>
    </div>
  );
}
