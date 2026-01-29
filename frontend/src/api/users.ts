import api from './client';
import { User } from '../types';

export const usersApi = {
  checkManagerExists: async (): Promise<boolean> => {
    try {
      const response = await api.get<{ managerExists: boolean }>('/users/check-manager');
      return response.data.managerExists;
    } catch (error) {
      // If endpoint doesn't exist or error, return false to allow registration
      return false;
    }
  },

  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: { email: string; password: string; name: string; role: 'manager' | 'employee' }): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{ email: string; password: string; name: string; role: 'manager' | 'employee' }>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
