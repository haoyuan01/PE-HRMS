"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useUserProfile } from "@/hooks/useUserProfile";
import { PersonalInformationForm } from "@/components/modules/account/personal-information-form";
import { SecurityForm } from "@/components/modules/account/security-form";

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const { profile, isLoading, error, refetch } = useUserProfile(user?.uuid);

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

      {/* Content */}
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
  );
}
