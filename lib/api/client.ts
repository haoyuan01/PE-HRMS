import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { ROUTES } from "@/lib/constants";

export const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// All requests go to the single static /api/proxy route; the intended backend
// path (e.g. "users/123") is passed as the `__path` query param rather than in
// the URL, so we don't depend on a [...path] catch-all route (which Vercel can
// fail to register). Other query params (page, per_page, ...) are preserved.
apiClient.interceptors.request.use((config) => {
  const rawPath = (config.url ?? "").replace(/^\/+/, "");
  config.url = "/api/proxy";
  config.params = { ...(config.params ?? {}), __path: rawPath };
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);
