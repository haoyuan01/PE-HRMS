// A single payroll/payslip record for a user in a given month.
// NOTE: the exact backend field names for amounts/attachment aren't documented
// yet — these are best-effort and read defensively in the UI.
export interface PayrollItem {
  uuid: string;
  month?: number | string | null;
  year?: number | string | null;
  is_published?: boolean;
  is_active?: boolean;
  remark?: string | null;
  attachment_path?: string | null;
  attachment_name?: string | null;
  created_at?: string | null;
}

// The list endpoint returns user objects (all users), each with a nested
// `payrolls` array plus the profile info used by the staff listing.
export interface PayrollUser {
  uuid: string;
  email: string;
  personal: {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    image_path: string | null;
  } | null;
  employment: {
    department: { name: string } | null;
    office: { name: string } | null;
  } | null;
  payrolls?: PayrollItem[];
}

export interface PayrollListResponse {
  success: boolean;
  data: PayrollUser | PayrollUser[];
}
