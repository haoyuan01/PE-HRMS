"use client";

import { useRef, useState } from "react";
import { Plus, Award, Pencil, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCertificates } from "@/hooks/useCertificates";
import { certificateApi } from "@/lib/api/certificate";
import { CertificateFormModal } from "@/components/modules/account/certificate-form-modal";
import type { UserCertificate } from "@/types/certificate";

function formatDate(value: string | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
}

function DeleteConfirm({
  certificate,
  onClose,
  onDeleted,
}: {
  certificate: UserCertificate;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const remove = async () => {
    setIsDeleting(true);
    try {
      await certificateApi.deleteCertificate(certificate.uuid);
      toast.success("Certificate deleted.");
      onDeleted();
    } catch {
      toast.error("Failed to delete certificate.");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]">
        <h2 className="font-display text-lg font-bold text-on-surface">
          Delete Certificate
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Are you sure you want to delete{" "}
          <span className="font-medium text-on-surface">{certificate.name}</span>?
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={remove}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-ds-error px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface CertificateTabProps {
  userUuid: string;
}

export function CertificateTab({ userUuid }: CertificateTabProps) {
  const { certificates, isLoading, error, refetch } = useCertificates(userUuid);
  const [isAdding, setIsAdding] = useState(false);
  const [edit, setEdit] = useState<UserCertificate | null>(null);
  const [del, setDel] = useState<UserCertificate | null>(null);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold text-on-surface">
            Certificates
          </h2>
          <p className="text-xs text-on-surface-variant">
            Your certificates and qualifications.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 rounded-[0.75rem] bg-gradient-to-br from-ds-primary to-ds-primary-dim px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add New Certificate
        </button>
      </div>

      {/* List Card */}
      <div className="rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        {error ? (
          <div className="p-8">
            <p className="text-sm text-ds-error">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-surface-container-low"
              />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-on-surface-variant">
            <Award className="h-8 w-8 opacity-40" />
            <p className="text-sm">No certificates added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Date Applied
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Valid Until
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    File
                  </th>
                  <th className="py-3 pl-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {certificates.map((c) => (
                  <tr
                    key={c.uuid}
                    className="transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="py-3 pl-6 pr-4 text-sm font-medium text-on-surface">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {c.organization || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatDate(c.date_applied)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">
                      {formatDate(c.valid_until)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.attachment_path ? (
                        <a
                          href={c.attachment_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                        >
                          View Attachment
                        </a>
                      ) : (
                        <span className="text-sm text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="py-3 pl-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEdit(c)}
                          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDel(c)}
                          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-ds-error/10 hover:text-ds-error"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdding && (
        <CertificateFormModal
          userUuid={userUuid}
          onClose={() => setIsAdding(false)}
          onSaved={() => {
            setIsAdding(false);
            refetch();
          }}
        />
      )}

      {edit && (
        <CertificateFormModal
          userUuid={userUuid}
          certificate={edit}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            refetch();
          }}
        />
      )}

      {del && (
        <DeleteConfirm
          certificate={del}
          onClose={() => setDel(null)}
          onDeleted={() => {
            setDel(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
