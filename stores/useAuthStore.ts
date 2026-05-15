import { create } from "zustand";
import type { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  permissions: [],
  isAuthenticated: false,
  hasHydrated: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),
  setPermissions: (permissions) => set({ permissions }),
  clearAuth: () =>
    set({
      user: null,
      permissions: [],
      isAuthenticated: false,
    }),
  setHasHydrated: (state) => set({ hasHydrated: state }),
}));
