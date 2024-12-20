import { Course, CreateCourseData, UpdateCourseData } from '../types/course';
import { SERVER_CONFIG } from '../config';

const BASE_URL = `${SERVER_CONFIG.BASE_URL}/api/academic-years`;

export const courseService = {
  async getAll(): Promise<Course[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  async create(data: CreateCourseData): Promise<Course> {
    const token = localStorage.getItem('token');
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create course');
    }
    
    return response.json();
  },

  async update(id: number, data: UpdateCourseData): Promise<Course> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update course');
    }
    
    return response.json();
  },

  async toggleStatus(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to toggle course status');
  },

  async delete(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to delete course');
  },
}