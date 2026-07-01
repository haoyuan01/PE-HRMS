import { create } from "zustand";
import type { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  permissions: [],
  isManager: false,
  isAccountant: false,
  isAuthenticated: false,
  hasHydrated: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),
  setPermissions: (permissions) => set({ permissions }),
  setEmploymentFlags: ({ isManager, isAccountant }) =>
    set({ isManager, isAccountant }),
  clearAuth: () =>
    set({
      user: null,
      permissions: [],
      isManager: false,
      isAccountant: false,
      isAuthenticated: false,
    }),
  setHasHydrated: (state) => set({ hasHydrated: state }),
}));
