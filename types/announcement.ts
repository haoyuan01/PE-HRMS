import type { Pagination } from "@/types/user";

export interface AnnouncementImage {
  uuid: string;
  image_path: string | null;
}

export interface Announcement {
  uuid: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_published: boolean;
  is_active: boolean;
  images: AnnouncementImage[];
}

export interface AnnouncementListResponse {
  success: boolean;
  data: Announcement[];
  pagination: Pagination;
}
