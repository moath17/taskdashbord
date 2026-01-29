import api from './client';
import { Proposal } from '../types';

export const proposalsApi = {
  getAll: async (): Promise<Proposal[]> => {
    const response = await api.get<Proposal[]>('/proposals');
    return response.data;
  },

  getById: async (id: string): Promise<Proposal> => {
    const response = await api.get<Proposal>(`/proposals/${id}`);
    return response.data;
  },

  create: async (data: Omit<Proposal, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Proposal> => {
    const response = await api.post<Proposal>('/proposals', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<Proposal, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>>): Promise<Proposal> => {
    const response = await api.put<Proposal>(`/proposals/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/proposals/${id}`);
  },
};

