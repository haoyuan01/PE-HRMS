export interface Permission {
  code: string;
  name: string;
  module?: string;
}

export interface Role {
  uuid: string;
  name: string;
  guard_name: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  permissions: Permission[];
}

export interface User {
  uuid: string;
  email: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  personal?: {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    image_path: string | null;
    [key: string]: unknown;
  } | null;
  employment?: {
    is_manager?: boolean | null;
    is_accountant?: boolean | null;
    [key: string]: unknown;
  } | null;
  roles: Role[];
}

export interface LoginRequest {
  email: string;
  password: string;
  keepLoggedIn: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
  permissions?: string[];
  isManager?: boolean;
  isAccountant?: boolean;
}

export interface AuthState {
  user: User | null;
  permissions: string[];
  isManager: boolean;
  isAccountant: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: User) => void;
  setPermissions: (permissions: string[]) => void;
  setEmploymentFlags: (flags: {
    isManager: boolean;
    isAccountant: boolean;
  }) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}
