export interface Course {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
}

export interface CreateCourseData {
  name: string;
  start_date: string;
  end_date: string;
}

export interface UpdateCourseData extends CreateCourseData {
  active?: boolean;
}