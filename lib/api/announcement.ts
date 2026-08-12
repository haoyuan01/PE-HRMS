import { apiClient } from "@/lib/api/client";
import type { Pagination } from "@/types/user";
import type { Announcement, AnnouncementListResponse } from "@/types/announcement";

export interface AnnouncementParams {
  page?: number;
  size?: number;
  name?: string;
  start_date?: string;
  end_date?: string;
  is_published?: boolean;
}

export const announcementApi = {
  getAnnouncements: async (
    params?: AnnouncementParams
  ): Promise<{ announcements: Announcement[]; pagination: Pagination | null }> => {
    const response = await apiClient.get<AnnouncementListResponse>(
      "/announcements",
      { params }
    );
    return {
      announcements: response.data.data ?? [],
      pagination: response.data.pagination ?? null,
    };
  },

  // Fresh single record for prefilling the edit form.
  getAnnouncement: async (uuid: string): Promise<Announcement> => {
    const response = await apiClient.get<{ data: Announcement }>(
      `/announcements/${uuid}`
    );
    return response.data.data;
  },

  createAnnouncement: async (
    data: AnnouncementPayload,
    images: File[]
  ): Promise<void> => {
    const formData = new FormData();
    appendScalars(formData, data);
    images.forEach((file, i) => formData.append(`images[${i}]`, file));

    await apiClient.post("/announcements", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateAnnouncement: async (
    uuid: string,
    data: AnnouncementPayload,
    keptImageUuids: string[],
    newImages: File[]
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    appendScalars(formData, data);
    let idx = 0;
    keptImageUuids.forEach((imgUuid) => {
      formData.append(`images[${idx}][uuid]`, imgUuid);
      idx++;
    });
    newImages.forEach((file) => {
      formData.append(`images[${idx}][image]`, file);
      idx++;
    });

    await apiClient.post(`/announcements/${uuid}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Soft-delete — deactivates the announcement (follows the is_active convention).
  deleteAnnouncement: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/announcements/${uuid}`, { is_active: false });
  },
};

export interface AnnouncementPayload {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
}

function appendScalars(formData: FormData, data: AnnouncementPayload) {
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("start_date", data.start_date);
  formData.append("end_date", data.end_date);
  formData.append("is_published", data.is_published ? "1" : "0");
}
