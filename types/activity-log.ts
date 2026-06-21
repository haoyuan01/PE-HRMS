export interface ActivityLogUser {
  uuid: string;
  email: string;
  is_active?: boolean;
}

export interface ActivityLog {
  uuid: string;
  log_name: string;
  event: string;
  description: string;
  subject_type: string;
  subject_id: string;
  causer_type: string | null;
  causer_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  user: ActivityLogUser | null;
}
