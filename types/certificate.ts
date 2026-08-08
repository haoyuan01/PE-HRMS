export interface UserCertificate {
  uuid: string;
  name: string;
  organization: string | null;
  description: string | null;
  date_applied: string | null;
  valid_until: string | null;
  attachment_path: string | null;
  // Added by a future backend update; falls back to a generic label if absent.
  attachment_name?: string | null;
}

// The list endpoint returns user objects, each with a nested `certificates`
// array (plus profile info used by the admin listing).
export interface CertificateUser {
  uuid: string;
  email: string;
  personal: {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    image_path: string | null;
  } | null;
  employment: {
    department: { name: string } | null;
    office: { name: string } | null;
  } | null;
  certificates?: UserCertificate[];
}

export interface CertificateListResponse {
  success: boolean;
  data: CertificateUser | CertificateUser[];
}
