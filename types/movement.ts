// A staff-movement record. Field names are best-effort (the endpoint returned
// no sample rows yet) and read defensively in the UI.
export interface MovementUser {
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
    position: { name: string } | null;
  } | null;
}

export interface Movement {
  uuid: string;
  movement_type: { uuid: string; name: string } | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  description: string | null;
  attachment_path: string | null;
  user: MovementUser | null;
}

export interface MovementPagination {
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
  per_page: number;
  total: number;
  count: number;
}

export interface MovementListResponse {
  success: boolean;
  data: Movement[];
  pagination: MovementPagination;
}

// The calendar endpoint returns movements grouped by date ("yyyy-MM-dd" →
// Movement[]), or an empty array when there's nothing in range.
export interface MovementCalendarResponse {
  success: boolean;
  message: string;
  data: Record<string, Movement[]> | Movement[];
}
