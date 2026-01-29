import api from './client';
import { WeeklyUpdate } from '../types';

export const weeklyUpdatesApi = {
  getAll: async (): Promise<WeeklyUpdate[]> => {
    const response = await api.get<WeeklyUpdate[]>('/weekly-updates');
    return response.data;
  },

  getById: async (id: string): Promise<WeeklyUpdate> => {
    const response = await api.get<WeeklyUpdate>(`/weekly-updates/${id}`);
    return response.data;
  },

  create: async (data: Omit<WeeklyUpdate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<WeeklyUpdate> => {
    const response = await api.post<WeeklyUpdate>('/weekly-updates', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<WeeklyUpdate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>>): Promise<WeeklyUpdate> => {
    const response = await api.put<WeeklyUpdate>(`/weekly-updates/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/weekly-updates/${id}`);
  },
};

