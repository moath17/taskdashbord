import api from './client';
import { AnnualGoal, MBOGoal } from '../types';

export const goalsApi = {
  // Annual Goals
  getAllAnnualGoals: async (): Promise<AnnualGoal[]> => {
    const response = await api.get<AnnualGoal[]>('/goals/annual');
    return response.data;
  },

  getAnnualGoalsByUser: async (userId: string): Promise<AnnualGoal[]> => {
    const response = await api.get<AnnualGoal[]>(`/goals/annual/user/${userId}`);
    return response.data;
  },

  createAnnualGoal: async (data: {
    title: string;
    description?: string;
    year: number;
  }): Promise<AnnualGoal> => {
    const response = await api.post<AnnualGoal>('/goals/annual', data);
    return response.data;
  },

  updateAnnualGoal: async (
    id: string,
    data: Partial<{ title: string; description: string; year: number }>
  ): Promise<AnnualGoal> => {
    const response = await api.put<AnnualGoal>(`/goals/annual/${id}`, data);
    return response.data;
  },

  deleteAnnualGoal: async (id: string): Promise<void> => {
    await api.delete(`/goals/annual/${id}`);
  },

  // MBO Goals
  getAllMBOGoals: async (): Promise<MBOGoal[]> => {
    const response = await api.get<MBOGoal[]>('/goals/mbo');
    return response.data;
  },

  getMBOGoalsByAnnualGoal: async (annualGoalId: string): Promise<MBOGoal[]> => {
    const response = await api.get<MBOGoal[]>(`/goals/mbo/annual/${annualGoalId}`);
    return response.data;
  },

  getMBOGoalsByUser: async (userId: string): Promise<MBOGoal[]> => {
    const response = await api.get<MBOGoal[]>(`/goals/mbo/user/${userId}`);
    return response.data;
  },

  createMBOGoal: async (data: {
    title: string;
    description?: string;
    annualGoalId: string;
    userId?: string;
    targetValue?: string;
    currentValue?: string;
  }): Promise<MBOGoal> => {
    const response = await api.post<MBOGoal>('/goals/mbo', data);
    return response.data;
  },

  updateMBOGoal: async (
    id: string,
    data: Partial<{ title: string; description: string; targetValue: string; currentValue: string }>
  ): Promise<MBOGoal> => {
    const response = await api.put<MBOGoal>(`/goals/mbo/${id}`, data);
    return response.data;
  },

  deleteMBOGoal: async (id: string): Promise<void> => {
    await api.delete(`/goals/mbo/${id}`);
  },
};

