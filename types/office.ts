export interface Office {
  uuid: string;
  name: string;
  description: string | null;
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
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}
