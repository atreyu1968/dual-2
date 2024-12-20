import { Group, CreateGroupData, UpdateGroupData } from '../types/group';
import { SERVER_CONFIG } from '../config';

const BASE_URL = `${SERVER_CONFIG.BASE_URL}/api/groups`;

export const groupService = {
  async getAll(): Promise<Group[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to fetch groups');
    return response.json();
  },

  async create(data: CreateGroupData): Promise<Group> {
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
      throw new Error(error.message || 'Failed to create group');
    }
    
    return response.json();
  },

  async update(id: number, data: UpdateGroupData): Promise<Group> {
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
      throw new Error(error.message || 'Failed to update group');
    }
    
    return response.json();
  },

  async toggleStatus(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to toggle group status');
  },

  async delete(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to delete group');
  },
}