import { apiClient } from "@/lib/api/client";
import type {
  UserProfileResponse,
  UserListResponse,
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

  updatePersonal: async (
    userUuid: string,
    data: {
      full_name?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      identity_number?: string | null;
      passport_number?: string | null;
      passport_expiry_date?: string | null;
      blood_type?: string | null;
      gender?: boolean | null;
      is_married?: boolean | null;
      image?: File;
    }
  ): Promise<UserProfileResponse> => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("user_uuid", userUuid);

    if (data.full_name != null) formData.append("full_name", data.full_name);
    if (data.first_name != null) formData.append("first_name", data.first_name);
    if (data.last_name != null) formData.append("last_name", data.last_name);
    if (data.identity_number != null) formData.append("identity_number", data.identity_number);
    if (data.passport_number != null) formData.append("passport_number", data.passport_number);
    if (data.passport_expiry_date != null) formData.append("passport_expiry_date", data.passport_expiry_date);
    if (data.blood_type != null) formData.append("blood_type", data.blood_type);
    if (data.gender != null) formData.append("gender", data.gender ? "1" : "0");
    if (data.is_married != null) formData.append("is_married", data.is_married ? "1" : "0");
    if (data.image instanceof File) formData.append("image", data.image);

    const response = await apiClient.post<UserProfileResponse>(
      "/user-personals",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  updateContact: async (
    userUuid: string,
    data: {
      company_email?: string | null;
      phone_number?: string | null;
      address_1?: string | null;
      address_2?: string | null;
      address_3?: string | null;
      city?: string | null;
      state?: string | null;
      postcode?: string | null;
      country?: string | null;
    }
  ): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>(
      "/user-contacts",
      { user_uuid: userUuid, ...data }
    );
    return response.data;
  },

  updateEmployment: async (
    userUuid: string,
    data: {
      department_uuid?: string | null;
      position_uuid?: string | null;
      office_uuid?: string | null;
      joined_date?: string | null;
    }
  ): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>(
      "/user-employments",
      { user_uuid: userUuid, ...data }
    );
    return response.data;
  },

  updateEmergency: async (
    userUuid: string,
    data: {
      name?: string | null;
      phone_number?: string | null;
      relationship?: string | null;
    }
  ): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>(
      "/user-emergencies",
      { user_uuid: userUuid, ...data }
    );
    return response.data;
  },

  deleteUser: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/users/${uuid}`, { is_active: false });
  },

  reactivateUser: async (uuid: string): Promise<void> => {
    await apiClient.patch(`/users/${uuid}`, { is_active: true });
  },

  changePassword: async (uuid: string, data: ChangePasswordRequest): Promise<void> => {
    await apiClient.patch(`/users/${uuid}/password`, data);
  },
};
