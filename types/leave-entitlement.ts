import type { Pagination } from "@/types/user";
import type { LeavePolicy } from "@/types/leave-policy";

export interface LeaveEntitlement {
  uuid: string;
  year: string;
  entitled_days: string;
  used_days: string;
  balance_days: string;
  carried_forward_days: string;
  carry_forward_expiry_date: string | null;
  is_active: boolean;
  leave_policy: LeavePolicy;
}

export interface LeaveEntitlementUser {
  uuid: string;
  email: string;
  is_active: boolean;
  personal: {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    image_path: string | null;
  } | null;
  leave_entitlements: LeaveEntitlement[];
}

export interface LeaveEntitlementListResponse {
  success: boolean;
  data: LeaveEntitlementUser[];
  pagination?: Pagination;
}

// A leave day rendered on the attendance calendar. Keyed by "yyyy-MM-dd".
export interface AttendanceEvent {
  label: string;
  tone?: "amber" | "red" | "blue" | "green";
}
