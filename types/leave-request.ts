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
