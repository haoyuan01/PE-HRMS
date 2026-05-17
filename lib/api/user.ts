import { apiClient } from "@/lib/api/client";
import type {
  UserProfileResponse,
  UserListResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/user";

export const userApi = {
  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    name?: string;
    department?: string;
    position?: string;
  }): Promise<UserListResponse> => {
    const response = await apiClient.get<UserListResponse>("/users", { params });
    return response.data;
  },

  getProfile: async (uuid: string): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>(
      `/users/${uuid}`
    );
    return response.data;
  },

  updateProfile: async (
    uuid: string,
    data: UpdateProfileRequest
  ): Promise<UserProfileResponse> => {
    const formData = new FormData();
    formData.append("_method", "PUT");

    // Top-level fields
    if (data.email) formData.append("email", data.email);
    if (data.role_uuid) formData.append("role_uuid", data.role_uuid);

    // Personal fields
    if (data.personal) {
      const p = data.personal;
      if (p.full_name != null) formData.append("personal[full_name]", p.full_name);
      if (p.first_name != null) formData.append("personal[first_name]", p.first_name);
      if (p.last_name != null) formData.append("personal[last_name]", p.last_name);
      if (p.identity_number != null) formData.append("personal[identity_number]", p.identity_number);
      if (p.passport_number != null) formData.append("personal[passport_number]", p.passport_number);
      if (p.passport_expiry_date != null) formData.append("personal[passport_expiry_date]", p.passport_expiry_date);
      if (p.blood_type != null) formData.append("personal[blood_type]", p.blood_type);
      if (p.gender != null) formData.append("personal[gender]", p.gender ? "1" : "0");
      if (p.is_married != null) formData.append("personal[is_married]", p.is_married ? "1" : "0");
      if (p.image instanceof File) formData.append("personal[image]", p.image);
    }

    // Contact fields
    if (data.contact) {
      const c = data.contact;
      if (c.company_email != null) formData.append("contact[company_email]", c.company_email);
      if (c.phone_number != null) formData.append("contact[phone_number]", c.phone_number);
      if (c.address_1 != null) formData.append("contact[address_1]", c.address_1);
      if (c.address_2 != null) formData.append("contact[address_2]", c.address_2);
      if (c.address_3 != null) formData.append("contact[address_3]", c.address_3);
      if (c.city != null) formData.append("contact[city]", c.city);
      if (c.state != null) formData.append("contact[state]", c.state);
      if (c.postcode != null) formData.append("contact[postcode]", c.postcode);
      if (c.country != null) formData.append("contact[country]", c.country);
    }

    // Emergency fields
    if (data.emergency) {
      const e = data.emergency;
      if (e.name != null) formData.append("emergency[name]", e.name);
      if (e.phone_number != null) formData.append("emergency[phone_number]", e.phone_number);
      if (e.relationship != null) formData.append("emergency[relationship]", e.relationship);
    }

    const response = await apiClient.post<UserProfileResponse>(
      `/users/${uuid}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  deleteUser: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/users/${uuid}`, { is_active: false });
  },

  changePassword: async (uuid: string, data: ChangePasswordRequest): Promise<void> => {
    await apiClient.patch(`/users/${uuid}/password`, data);
  },
};
