import { apiClient } from "@/lib/api/client";
import type {
  CertificateListResponse,
  CertificateUser,
  UserCertificate,
} from "@/types/certificate";

export interface CertificatePayload {
  user_uuid: string;
  name: string;
  organization: string;
  description: string;
  date_applied: string;
  valid_until: string;
}

export const certificateApi = {
  // All users with their nested certificates (for the admin listing).
  getCertificateUsers: async (): Promise<CertificateUser[]> => {
    const response = await apiClient.get<CertificateListResponse>(
      "/user-certificates"
    );
    const data = response.data.data;
    return Array.isArray(data) ? data : [data];
  },

  getCertificates: async (userUuid: string): Promise<UserCertificate[]> => {
    const response = await apiClient.get<CertificateListResponse>(
      "/user-certificates",
      { params: { user_uuid: userUuid } }
    );
    // The endpoint returns user objects (all users), each with a nested
    // `certificates` array — pick the one matching the requested user.
    const data = response.data.data;
    const users = Array.isArray(data) ? data : [data];
    const user = users.find((u) => u.uuid === userUuid) ?? users[0];
    return user?.certificates ?? [];
  },

  createCertificate: async (
    data: CertificatePayload,
    attachment?: File
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("user_uuid", data.user_uuid);
    formData.append("name", data.name);
    formData.append("organization", data.organization);
    formData.append("description", data.description);
    formData.append("date_applied", data.date_applied);
    formData.append("valid_until", data.valid_until);
    if (attachment) formData.append("attachment", attachment);

    await apiClient.post("/user-certificates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // NOTE: edit/delete endpoints are assumed — confirm against the backend.
  updateCertificate: async (
    uuid: string,
    data: CertificatePayload,
    attachment?: File
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("user_uuid", data.user_uuid);
    formData.append("name", data.name);
    formData.append("organization", data.organization);
    formData.append("description", data.description);
    formData.append("date_applied", data.date_applied);
    formData.append("valid_until", data.valid_until);
    if (attachment) formData.append("attachment", attachment);

    await apiClient.post(`/user-certificates/${uuid}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Soft-delete — deactivates the certificate.
  deleteCertificate: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/user-certificates/${uuid}`, { is_active: false });
  },
};
