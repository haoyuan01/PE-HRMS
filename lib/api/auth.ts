import axios from "axios";
import type { LoginRequest, LoginResponse, SessionResponse } from "@/types/auth";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(
      "/api/auth/login",
      data
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axios.post("/api/auth/logout");
  },

  getSession: async (): Promise<SessionResponse> => {
    const response = await axios.get<SessionResponse>(
      "/api/auth/session"
    );
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await axios.post("/api/auth/forgot-password", { email });
  },
};
