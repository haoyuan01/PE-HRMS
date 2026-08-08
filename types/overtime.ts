import type { Pagination } from "@/types/user";

export interface Overtime {
  uuid: string;
  description: string | null;
  total_days: string | null;
  attachment_path: string | null;
  director_action_at: string | null;
  director_approved: boolean;
  director_remark: string | null;
  created_at: string;
  user: {
    uuid: string;
    email: string;
    personal: {
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      image_path: string | null;
    } | null;
  };
}

export interface OvertimeListResponse {
  success: boolean;
  data: Overtime[];
  pagination: Pagination;
}
