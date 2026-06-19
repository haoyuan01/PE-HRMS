"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  PermissionForm,
  type PermissionFormValues,
} from "@/components/modules/configuration/permission-form";

const LIST_ROUTE = "/dashboard/configuration/role";

export default function AddPermissionPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (values: PermissionFormValues) => {
    setIsSaving(true);
    try {
      // TODO: wire to backend — roleApi.createRole(values)
      console.log("Create permission payload:", values);
      toast.success("Permission created.");
      router.push(LIST_ROUTE);
    } catch {
      toast.error("Failed to create permission. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
        <PermissionForm
          mode="create"
          isSaving={isSaving}
          onCancel={() => router.push(LIST_ROUTE)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
