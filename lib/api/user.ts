import { apiClient } from "@/lib/api/client";
import type {
  UserProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/user";

export const userApi = {
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
    const response = await apiClient.put<UserProfileResponse>(
      `/users/${uuid}`,
      data
    );
    return response.data;
  },

  changePassword: async (uuid: string, data: ChangePasswordRequest): Promise<void> => {
    await apiClient.patch(`/users/${uuid}/password`, data);
  },
};
