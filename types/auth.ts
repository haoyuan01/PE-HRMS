export interface Permission {
  code: string;
  name: string;
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
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}
