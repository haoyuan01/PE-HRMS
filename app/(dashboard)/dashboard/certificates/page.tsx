"use client";

import { CertificateUsersTable } from "@/components/modules/certificate/certificate-users-table";

export default function CertificatePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant">
          Records
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-on-surface">
          Certificate
        </h1>
      </div>

      <CertificateUsersTable />
    </div>
  );
}
