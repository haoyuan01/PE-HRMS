import { apiClient } from "@/lib/api/client";
import type {
  UserProfileResponse,
  UserListResponse,
  ChangePasswordRequest,
  ChangePasscodeRequest,
} from "@/types/user";

export const userApi = {
  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    name?: string;
    department?: string;
    position?: string;
    sortBy?: string;
    orderBy?: string;
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

  // Updates the user record itself (role, email). role_uuid lives on the user,
  // not on /user-employments — this hits PUT /users/{uuid} (via _method=PUT).
  updateUser: async (
    uuid: string,
    data: { email?: string; role_uuid?: string | null }
  ): Promise<UserProfileResponse> => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    if (data.email != null) formData.append("email", data.email);
    if (data.role_uuid != null) formData.append("role_uuid", data.role_uuid);

    const response = await apiClient.post<UserProfileResponse>(
      `/users/${uuid}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
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

  createUser: async (data: {
    email: string;
    password: string;
    passcode?: string;
    role_uuid: string;
    personal?: {
      full_name?: string;
      first_name?: string;
      last_name?: string;
      identity_number?: string;
      passport_number?: string;
      passport_expiry_date?: string;
      blood_type?: string;
      gender?: boolean;
      is_married?: boolean;
      image?: File;
    };
    contact?: {
      company_email?: string;
      phone_number?: string;
      address_1?: string;
      address_2?: string;
      address_3?: string;
      city?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
    employment?: {
      position_uuid?: string;
      department_uuid?: string;
      office_uuid?: string;
      joined_date?: string;
    };
    emergency?: {
      name?: string;
      phone_number?: string;
      relationship?: string;
    };
  }): Promise<UserProfileResponse> => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("passcode", data.passcode ?? "");
    formData.append("role_uuid", data.role_uuid);

    if (data.personal) {
      const p = data.personal;
      if (p.full_name) formData.append("personal[full_name]", p.full_name);
      if (p.first_name) formData.append("personal[first_name]", p.first_name);
      if (p.last_name) formData.append("personal[last_name]", p.last_name);
      if (p.identity_number) formData.append("personal[identity_number]", p.identity_number);
      if (p.passport_number) formData.append("personal[passport_number]", p.passport_number);
      if (p.passport_expiry_date) formData.append("personal[passport_expiry_date]", p.passport_expiry_date);
      if (p.blood_type) formData.append("personal[blood_type]", p.blood_type);
      if (p.gender != null) formData.append("personal[gender]", p.gender ? "1" : "0");
      if (p.is_married != null) formData.append("personal[is_married]", p.is_married ? "1" : "0");
      if (p.image instanceof File) formData.append("personal[image]", p.image);
    }

    if (data.contact) {
      const c = data.contact;
      if (c.company_email) formData.append("contact[company_email]", c.company_email);
      if (c.phone_number) formData.append("contact[phone_number]", c.phone_number);
      if (c.address_1) formData.append("contact[address_1]", c.address_1);
      if (c.address_2) formData.append("contact[address_2]", c.address_2);
      if (c.address_3) formData.append("contact[address_3]", c.address_3);
      if (c.city) formData.append("contact[city]", c.city);
      if (c.state) formData.append("contact[state]", c.state);
      if (c.postcode) formData.append("contact[postcode]", c.postcode);
      if (c.country) formData.append("contact[country]", c.country);
    }

    if (data.employment) {
      const emp = data.employment;
      if (emp.position_uuid) formData.append("employment[position_uuid]", emp.position_uuid);
      if (emp.department_uuid) formData.append("employment[department_uuid]", emp.department_uuid);
      if (emp.office_uuid) formData.append("employment[office_uuid]", emp.office_uuid);
      if (emp.joined_date) formData.append("employment[joined_date]", emp.joined_date);
    }

    if (data.emergency) {
      const e = data.emergency;
      if (e.name) formData.append("emergency[name]", e.name);
      if (e.phone_number) formData.append("emergency[phone_number]", e.phone_number);
      if (e.relationship) formData.append("emergency[relationship]", e.relationship);
    }

    const response = await apiClient.post<UserProfileResponse>(
      "/users",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
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

  changePasscode: async (uuid: string, data: ChangePasscodeRequest): Promise<void> => {
    await apiClient.patch(`/users/${uuid}/passcode`, data);
  },
};
