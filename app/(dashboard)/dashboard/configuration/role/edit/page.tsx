"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePermissionGroups } from "@/hooks/usePermissionGroups";
import { useRequirePermission } from "@/hooks/useRequirePermission";
import { roleApi } from "@/lib/api/role";
import { PermissionForm } from "@/components/modules/configuration/permission-form";
import type { Role } from "@/types/auth";

const LIST_ROUTE = "/dashboard/configuration/role";

function EditPermissionContent() {
  const uuid = useSearchParams().get("uuid") ?? "";
  const router = useRouter();
  const allowed = useRequirePermission("role_update", LIST_ROUTE);
  const { groups, isLoading: isLoadingGroups, error: groupsError, refetch } =
    usePermissionGroups();
  const [role, setRole] = useState<Role | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    roleApi
      .getRole(uuid)
      .then((data) => {
        if (active) setRole(data);
      })
      .catch(() => {
        if (active) setRoleError("Failed to load permission.");
      })
      .finally(() => {
        if (active) setIsLoadingRole(false);
      });
    return () => {
      active = false;
    };
  }, [uuid]);

  // Match the role's assigned permissions (by name) to their lookup uuids.
  const defaultSelected =
    groups && role
      ? Object.values(groups)
          .flat()
          .filter((option) =>
            role.permissions.some((p) => p.name === option.name)
          )
          .map((option) => option.uuid)
      : [];

  const handleSubmit = async (values: {
    name: string;
    permissionUuids: string[];
  }) => {
    setIsSaving(true);
    try {
      await roleApi.updateRole(uuid, {
        name: values.name,
        permissions: values.permissionUuids.map((id) => ({ uuid: id })),
      });
      toast.success("Permission updated successfully.");
      router.push(LIST_ROUTE);
    } catch {
      toast.error("Failed to update permission. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingGroups || isLoadingRole;
  const error = groupsError ?? roleError;

  // Block direct URL access for users without update permission.
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
            Update Permission
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
        ) : error || !groups || !role ? (
          <div>
            <p className="text-sm text-ds-error">{error ?? "Failed to load permission."}</p>
            <button
              onClick={refetch}
              className="mt-3 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
            >
              Try again
            </button>
          </div>
        ) : (
          <PermissionForm
            mode="edit"
            groups={groups}
            defaultName={role.name}
            defaultSelected={defaultSelected}
            isSaving={isSaving}
            onCancel={() => router.push(LIST_ROUTE)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default function EditPermissionPage() {
  return (
    <Suspense fallback={null}>
      <EditPermissionContent />
    </Suspense>
  );
}
