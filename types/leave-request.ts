export interface CalendarLeaveRequestUser {
  uuid: string;
  email: string;
  personal: {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    image_path: string | null;
  } | null;
}

export interface CalendarLeaveRequest {
  uuid: string;
  start_date: string;
  end_date: string;
  resume_date: string | null;
  total_days: string;
  is_half_day: boolean;
  is_first_half: boolean;
  reason: string | null;
  attachment_url: string | null;
  manager_action_at: string | null;
  manager_approved: boolean;
  director_action_at: string | null;
  director_approved: boolean;
  user: CalendarLeaveRequestUser;
  leave_entitlement: {
    leave_policy: { name: string; code: string } | null;
  } | null;
}

export interface CalendarDaySummary {
  date: string;
  total: number;
  leave_requests: CalendarLeaveRequest[];
}

export interface CalendarSummaryResponse {
  success: boolean;
  message: string;
  data: Record<string, CalendarDaySummary>;
}

// A row in the Leave Requests table.
export interface LeaveRequest {
  uuid: string;
  start_date: string;
  end_date: string;
  resume_date: string | null;
  total_days: string;
  is_half_day: boolean;
  reason: string | null;
  attachment_url: string | null;
  manager_action_at: string | null;
  manager_approved: boolean;
  director_action_at: string | null;
  director_approved: boolean;
  is_active: boolean;
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
    employment: {
      department: { name: string } | null;
    } | null;
  };
  leave_entitlement: {
    leave_policy: { name: string; code: string } | null;
  } | null;
}

export interface LeaveStatusSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface LeaveRequestPerson {
  uuid: string;
  email: string;
  personal: {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    image_path: string | null;
  } | null;
  employment?: {
    position: { name: string } | null;
    department: { name: string } | null;
  } | null;
}

export interface LeaveRequestDetail {
  uuid: string;
  start_date: string;
  end_date: string;
  resume_date: string | null;
  total_days: string;
  is_half_day: boolean;
  is_first_half: boolean;
  reason: string | null;
  attachment_url: string | null;
  handover_remark: string | null;
  manager_remark: string | null;
  director_remark: string | null;
  manager_action_at: string | null;
  manager_approved: boolean;
  director_action_at: string | null;
  director_approved: boolean;
  created_at: string;
  user: LeaveRequestPerson;
  manager_approver: LeaveRequestPerson | null;
  handover_by: LeaveRequestPerson | null;
  leave_entitlement: {
    leave_policy: { name: string; code: string } | null;
  } | null;
}
