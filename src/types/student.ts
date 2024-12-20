export interface Student {
  id: number;
  cial: string;
  dni: string;
  nuss: string;
  full_name: string;
  email: string;
  phone: string;
  group_id: number;
  group_name: string;
  active: boolean;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  academic_year_id: number;
  academic_year_name: string;
  student_count: number;
  active: boolean;
  created_at: string;
}