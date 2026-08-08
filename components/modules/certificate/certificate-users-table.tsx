"use client";

import { Fragment, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCertificateUsers } from "@/hooks/useCertificateUsers";
import { certificateApi } from "@/lib/api/certificate";
import { CertificateFormModal } from "@/components/modules/account/certificate-form-modal";
import type { CertificateUser, UserCertificate } from "@/types/certificate";

function formatDate(value: string | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
}

function Avatar({ user }: { user: CertificateUser }) {
  const [failed, setFailed] = useState(false);
  const personal = user.personal;
  const name = personal?.full_name ?? user.email;
  const image = personal?.image_path;
  const initials =
    (personal?.first_name?.[0] ?? "") + (personal?.last_name?.[0] ?? "") ||
    (user.email[0]?.toUpperCase() ?? "?");
  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-container-high">
      {image && !failed ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="36px"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-on-surface-variant">
          {initials}
        </span>
      )}
    </div>
  );
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

export function CertificateUsersTable() {
  const { users, isLoading, error, refetch } = useCertificateUsers();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // Modals
  const [addFor, setAddFor] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ userUuid: string; cert: UserCertificate } | null>(null);
  const [del, setDel] = useState<UserCertificate | null>(null);

  const toggle = (uuid: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(uuid) ? next.delete(uuid) : next.add(uuid);
      return next;
    });

  if (error) {
    return (
      <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
        <p className="text-sm text-ds-error">{error}</p>
        <button
          onClick={refetch}
          className="mt-3 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-container-low" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
          <p className="text-sm">No employees found.</p>
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
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Branch Office
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Certificates
                </th>
                <th className="py-3 pl-4 pr-6 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {users.map((u) => {
                const certs = u.certificates ?? [];
                const isOpen = expanded.has(u.uuid);
                return (
                  <Fragment key={u.uuid}>
                    <tr className="transition-colors hover:bg-surface-container-low/50">
                      <td className="py-3 pl-6 pr-4 text-sm">
                        <div className="flex items-center gap-3">
                          <Avatar user={u} />
                          <p className="min-w-0 truncate font-medium text-on-surface">
                            {u.personal?.full_name ?? u.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">
                        {u.employment?.department?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">
                        {u.employment?.office?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-on-surface">
                        {certs.length}
                      </td>
                      <td className="py-3 pl-4 pr-6">
                        <button
                          onClick={() => toggle(u.uuid)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-ds-primary transition-colors hover:text-ds-primary-dim"
                        >
                          View Cert
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-surface-container-low/30">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-lowest">
                            {certs.length > 0 && (
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/60">
                                    <th className="px-4 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                      Certificate
                                    </th>
                                    <th className="px-4 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                      Organization
                                    </th>
                                    <th className="px-4 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                      Date Applied
                                    </th>
                                    <th className="px-4 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                      Valid Until
                                    </th>
                                    <th className="px-4 py-2 text-right text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20">
                                  {certs.map((c) => (
                                    <tr key={c.uuid} className="bg-surface-container-lowest">
                                      <td className="px-4 py-2.5 text-xs font-medium text-on-surface">
                                        <div className="flex items-center gap-2">
                                          {c.attachment_path && (
                                            <a
                                              href={c.attachment_path}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              title="View file"
                                              className="text-ds-primary hover:text-ds-primary-dim"
                                            >
                                              <FileText className="h-4 w-4" />
                                            </a>
                                          )}
                                          {c.name}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2.5 text-xs text-on-surface-variant">
                                        {c.organization || "—"}
                                      </td>
                                      <td className="px-4 py-2.5 text-xs text-on-surface">
                                        {formatDate(c.date_applied)}
                                      </td>
                                      <td className="px-4 py-2.5 text-xs text-on-surface">
                                        {formatDate(c.valid_until)}
                                      </td>
                                      <td className="px-4 py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            onClick={() =>
                                              setEdit({ userUuid: u.uuid, cert: c })
                                            }
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
                            )}
                            {/* Full-width add line */}
                            <button
                              onClick={() => setAddFor(u.uuid)}
                              className={`flex w-full items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-ds-primary transition-colors hover:bg-surface-container-low ${
                                certs.length > 0
                                  ? "border-t border-outline-variant/20"
                                  : ""
                              }`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add New Certificate
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add */}
      {addFor && (
        <CertificateFormModal
          userUuid={addFor}
          onClose={() => setAddFor(null)}
          onSaved={() => {
            setAddFor(null);
            refetch();
          }}
        />
      )}

      {/* Edit */}
      {edit && (
        <CertificateFormModal
          userUuid={edit.userUuid}
          certificate={edit.cert}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            refetch();
          }}
        />
      )}

      {/* Delete */}
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
