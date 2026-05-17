import type { Role } from "@/types/auth";

export interface AuditFields {
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export interface Personal extends AuditFields {
  uuid: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  identity_number: string | null;
  passport_number: string | null;
  passport_expiry_date: string | null;
  blood_type: string | null;
  image_path: string | null;
  gender: boolean | null;
  is_married: boolean | null;
}

export interface Contact extends AuditFields {
  uuid: string;
  company_email: string | null;
  phone_number: string | null;
  address_1: string | null;
  address_2: string | null;
  address_3: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
}

export interface NamedEntity extends AuditFields {
  uuid: string;
  name: string;
  description: string | null;
}

export interface Office extends NamedEntity {
  address_1: string | null;
  address_2: string | null;
  address_3: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  phone_number: string | null;
  fax_number: string | null;
  email: string | null;
}

export interface Employment extends AuditFields {
  uuid: string;
  joined_date: string | null;
  position: NamedEntity | null;
  department: NamedEntity | null;
  office: Office | null;
}

export interface Emergency extends AuditFields {
  uuid: string;
  name: string | null;
  phone_number: string | null;
  relationship: string | null;
}

export interface UserProfile {
  uuid: string;
  email: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  personal: Personal | null;
  contact: Contact | null;
  employment: Employment | null;
  emergency: Emergency | null;
  roles: Role[];
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UpdateProfileRequest {
  email?: string;
  role_uuid?: string;
  personal?: Partial<Pick<Personal, "full_name" | "first_name" | "last_name" | "identity_number" | "passport_number" | "passport_expiry_date" | "blood_type" | "gender" | "is_married">> & {
    image?: File;
  };
  contact?: Partial<Pick<Contact, "company_email" | "phone_number" | "address_1" | "address_2" | "address_3" | "city" | "state" | "postcode" | "country">>;
  emergency?: Partial<Pick<Emergency, "name" | "phone_number" | "relationship">>;
}

export interface ChangePasswordRequest {
  password: string;
  password_confirmation: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
  per_page: number;
  total: number;
  count: number;
}

export interface UserListResponse {
  success: boolean;
  data: UserProfile[];
  pagination: Pagination;
}
