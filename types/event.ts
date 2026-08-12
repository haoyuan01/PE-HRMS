import type { Pagination } from "@/types/user";

export interface EventImage {
  uuid: string;
  image_path: string | null;
}

export interface EventOrg {
  uuid: string;
  name: string;
}

export interface UpcomingEvent {
  uuid: string;
  name: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_published: boolean;
  is_active: boolean;
  images: EventImage[];
  departments: EventOrg[];
  offices: EventOrg[];
}

export interface UpcomingEventListResponse {
  success: boolean;
  data: UpcomingEvent[];
  pagination: Pagination;
}
