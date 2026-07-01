import type { UserProfile } from "@/types/user";

export interface ClaimItem {
  uuid: string;
  name: string;
  amount: string;
  date: string | null;
  attachment_path: string | null;
  remark: string | null;
  is_active: boolean;
  approved_by: string | null;
  approved_at: string | null;
  released_by: string | null;
  released_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
}

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
  claim_items: ClaimItem[];
}
