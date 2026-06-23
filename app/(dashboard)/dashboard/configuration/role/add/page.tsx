"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePermissionGroups } from "@/hooks/usePermissionGroups";
import { useRequirePermission } from "@/hooks/useRequirePermission";
import { roleApi } from "@/lib/api/role";
import { PermissionForm } from "@/components/modules/configuration/permission-form";

const LIST_ROUTE = "/dashboard/configuration/role";

export default function AddPermissionPage() {
  const router = useRouter();
  const allowed = useRequirePermission("role_create", LIST_ROUTE);
  const { groups, isLoading, error, refetch } = usePermissionGroups();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    permissionUuids: string[];
  }) => {
    setIsSaving(true);
    try {
      await roleApi.createRole({
        name: values.name,
        permissions: values.permissionUuids.map((uuid) => ({ uuid })),
      });
      toast.success("Permission created successfully.");
      router.push(LIST_ROUTE);
    } catch {
      toast.error("Failed to create permission. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Block direct URL access for users without create permission.
  if (!allowed) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(LIST_ROUTE)}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            Configuration
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
            Create Permission
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] sm:p-6 md:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20">
            <Loader2 className="h-5 w-5 animate-spin text-on-surface-variant" />
            <span className="text-sm text-on-surface-variant">Loading...</span>
          </div>
        ) : error || !groups ? (
          <div>
            <p className="text-sm text-ds-error">{error ?? "Failed to load permissions."}</p>
            <button
              onClick={refetch}
              className="mt-3 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
            >
              Try again
            </button>
          </div>
        ) : (
          <PermissionForm
            mode="create"
            groups={groups}
            isSaving={isSaving}
            onCancel={() => router.push(LIST_ROUTE)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
