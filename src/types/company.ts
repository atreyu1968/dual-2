export interface WorkCenter {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  company_id: number;
  tutor_id?: number;
  active: boolean;
  created_at: string;
  tutor?: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface Company {
  id: number;
  name: string;
  legal_name: string;
  tax_id: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  website?: string;
  active: boolean;
  created_at: string;
  work_centers: WorkCenter[];
}