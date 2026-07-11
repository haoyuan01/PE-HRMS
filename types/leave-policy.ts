import type { Pagination } from "@/types/user";

export interface LeavePolicyTier {
  uuid: string;
  service_year_from: string;
  service_year_to: string;
  entitlement_days: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export interface LeavePolicy {
  uuid: string;
  name: string;
  code: string;
  description: string | null;
  allow_half_day: boolean;
  carry_forward_days: string;
  carry_forward_expiry_month: string | null;
  carry_forward_expiry_date: string | null;
  is_handover_required: boolean;
  handover_min_days: string;
  min_notice_days: string;
  requires_attachment: boolean;
  is_paid: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  leave_policy_tiers: LeavePolicyTier[];
}

export interface LeavePolicyListResponse {
  success: boolean;
  data: LeavePolicy[];
  pagination: Pagination;
}
