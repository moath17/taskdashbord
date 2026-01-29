import api from './client';
import { User } from '../types';

export interface TeamMemberData {
  email: string;
  password: string;
  name: string;
  role: 'manager' | 'employee';
}

export interface UpdateTeamMemberData {
  email?: string;
  name?: string;
  role?: 'manager' | 'employee';
}

export const usersApi = {
  // Get all users in the organization (for display)
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateTeamMemberData): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Team management API (for owners/managers to add team members)
export const teamApi = {
  // Get all team members in the organization
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/team');
    return response.data;
  },

  // Add a new team member
  create: async (data: TeamMemberData): Promise<User> => {
    const response = await api.post<User>('/team', data);
    return response.data;
  },

  // Update a team member
  update: async (id: string, data: UpdateTeamMemberData): Promise<User> => {
    const response = await api.put<User>(`/team/${id}`, data);
    return response.data;
  },

  // Delete a team member
  delete: async (id: string): Promise<void> => {
    await api.delete(`/team/${id}`);
  },
};
