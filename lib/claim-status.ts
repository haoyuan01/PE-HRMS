import type { ClaimHeader, ClaimItem } from "@/types/claim";

export interface StatusBadge {
  label: string;
  className: string;
}

const GREEN = "bg-emerald-500/10 text-emerald-600";
const PRIMARY = "bg-ds-primary/10 text-ds-primary";
const RED = "bg-ds-error/10 text-ds-error";
const BLUE = "bg-sky-500/10 text-sky-600";
const AMBER = "bg-amber-500/10 text-amber-600";

/**
 * Claim status from the backend's review definitions. Flow:
 * manager reviews → director (General Manager) reviews → accountant pays.
 * A manager rejection is final: the claim never reaches the director.
 *
 * Falls back to the older fields for responses without the definitions.
 */
export function claimStatus(claim: ClaimHeader): StatusBadge {
  if (claim.paid_at) return { label: "Paid", className: GREEN };

  switch (claim.director_review_definition) {
    case "director_approved":
      return { label: "Approved", className: PRIMARY };
    case "director_rejected":
      return { label: "Rejected", className: RED };
  }

  switch (claim.manager_review_definition) {
    case "manager_rejected":
      return { label: "Rejected by Manager", className: RED };
    case "manager_reviewed":
      return { label: "Pending GM Review", className: BLUE };
    case "manager_pending_review":
      return { label: "Pending Manager Review", className: AMBER };
  }

  // Fallback: no definitions in this response.
  if (claim.rejected_at) return { label: "Rejected", className: RED };
  if (claim.approved_at) return { label: "Approved", className: PRIMARY };
  if (claim.manager_reviewed_by && !claim.director_reviewed_by)
    return { label: "Pending GM Review", className: BLUE };
  if (claim.director_reviewed_by) return { label: "Reviewed", className: BLUE };
  return { label: "Pending Manager Review", className: AMBER };
}

/** True once the manager rejected the claim — it stops there. */
export function isManagerRejected(claim: ClaimHeader): boolean {
  return claim.manager_review_definition === "manager_rejected";
}

/**
 * An item's current outcome: the director's decision once made, otherwise
 * the manager's. Falls back to the action_at/approved flags.
 */
export function claimItemStatus(item: ClaimItem): StatusBadge {
  const director = item.director_approve_definition;
  if (director === "director_approved") return { label: "Approved", className: GREEN };
  if (director === "director_rejected") return { label: "Rejected", className: RED };
  if (director === undefined && item.director_action_at)
    return item.director_approved
      ? { label: "Approved", className: GREEN }
      : { label: "Rejected", className: RED };

  const manager = item.manager_approve_definition;
  if (manager === "manager_approved") return { label: "Approved", className: GREEN };
  if (manager === "manager_rejected") return { label: "Rejected", className: RED };
  if (manager === undefined && item.manager_action_at)
    return item.manager_approved
      ? { label: "Approved", className: GREEN }
      : { label: "Rejected", className: RED };

  return { label: "Pending", className: AMBER };
}
