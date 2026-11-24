import type { UserProfile } from "@/types/user";

export interface ClaimItem {
  uuid: string;
  name: string;
  amount: string;
  date: string | null;
  attachment_path: string | null;
  remark: string | null;
  is_active: boolean;
  // Manager review — `manager_action_at` is null until the manager acts;
  // `manager_approved` then distinguishes approve (true) from reject (false).
  manager_action_by: UserProfile | null;
  manager_action_at: string | null;
  manager_approved: boolean;
  // Director review — same shape as the manager fields.
  director_action_by: UserProfile | null;
  director_action_at: string | null;
  director_approved: boolean;
  /** Backend-computed item outcome per stage. */
  manager_approve_definition?: ClaimItemManagerDefinition | null;
  director_approve_definition?: ClaimItemDirectorDefinition | null;
}

export type ClaimItemManagerDefinition =
  | "manager_approved"
  | "manager_rejected"
  | "manager_pending";

export type ClaimItemDirectorDefinition =
  | "director_approved"
  | "director_rejected"
  | "director_pending";

/** manager_rejected = done, at least one item rejected (final, no director). */
export type ClaimManagerReviewDefinition =
  | "manager_pending_review"
  | "manager_rejected"
  | "manager_reviewed";

export type ClaimDirectorReviewDefinition =
  | "director_pending_review"
  | "director_rejected"
  | "director_approved";

export interface ClaimHeader {
  uuid: string;
  name: string;
  remark: string | null;
  total_amount: string;
  start_date: string | null;
  end_date: string | null;
  approved_at: string | null;
  paid_at: string | null;
  rejected_at: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  user: UserProfile | null;
  manager_approver: UserProfile | null;
  // Header-level review sign-off — null until that role reviews the claim.
  manager_reviewed_by: UserProfile | null;
  manager_reviewed_at?: string | null;
  manager_review_definition?: ClaimManagerReviewDefinition;
  director_reviewed_by: UserProfile | null;
  director_reviewed_at?: string | null;
  director_review_definition?: ClaimDirectorReviewDefinition;
  claim_items: ClaimItem[];
}
