import { apiClient } from "@/lib/api/client";
import type { Pagination } from "@/types/user";
import type { UpcomingEvent, UpcomingEventListResponse } from "@/types/event";

export interface UpcomingEventParams {
  page?: number;
  size?: number;
  name?: string;
  department_uuid?: string;
  office_uuid?: string;
  start_date?: string;
  end_date?: string;
  is_published?: boolean;
}

export const upcomingEventApi = {
  getUpcomingEvents: async (
    params?: UpcomingEventParams
  ): Promise<{ events: UpcomingEvent[]; pagination: Pagination | null }> => {
    const response = await apiClient.get<UpcomingEventListResponse>(
      "/upcoming-events",
      { params }
    );
    return {
      events: response.data.data ?? [],
      pagination: response.data.pagination ?? null,
    };
  },

  createUpcomingEvent: async (
    data: UpcomingEventPayload,
    images: File[]
  ): Promise<void> => {
    const formData = new FormData();
    appendScalars(formData, data);
    // New images are plain files: images[0], images[1], ...
    images.forEach((file, i) => formData.append(`images[${i}]`, file));

    await apiClient.post("/upcoming-events", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateUpcomingEvent: async (
    uuid: string,
    data: UpcomingEventPayload,
    // Existing images to keep (by uuid) and freshly-added files.
    keptImageUuids: string[],
    newImages: File[]
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    appendScalars(formData, data);
    // Images are objects: kept ones carry a uuid, new ones carry an image file.
    let idx = 0;
    keptImageUuids.forEach((imgUuid) => {
      formData.append(`images[${idx}][uuid]`, imgUuid);
      idx++;
    });
    newImages.forEach((file) => {
      formData.append(`images[${idx}][image]`, file);
      idx++;
    });

    await apiClient.post(`/upcoming-events/${uuid}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Soft-delete — deactivates the event (follows the is_active convention).
  deleteUpcomingEvent: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/upcoming-events/${uuid}`, { is_active: false });
  },
};

export interface UpcomingEventPayload {
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
  department_uuids: string[];
  office_uuids: string[];
}

// Appends the shared scalar + relation fields (everything except images).
function appendScalars(formData: FormData, data: UpcomingEventPayload) {
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("location", data.location);
  formData.append("start_date", data.start_date);
  formData.append("end_date", data.end_date);
  formData.append("is_published", data.is_published ? "1" : "0");
  data.department_uuids.forEach((uuid, i) =>
    formData.append(`department_uuid[${i}]`, uuid)
  );
  data.office_uuids.forEach((uuid, i) =>
    formData.append(`office_uuid[${i}]`, uuid)
  );
}
