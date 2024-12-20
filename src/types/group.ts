export interface Group {
  id: number;
  name: string;
  academic_year_id: number;
  academic_year_name: string;
  student_count: number;
  active: boolean;
  created_at: string;
}

export interface CreateGroupData {
  name: string;
  academic_year_id?: number; // Optional because it will use the active year by default
}

export interface UpdateGroupData {
  name: string;
  active?: boolean;
}