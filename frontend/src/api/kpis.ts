import api from './client';
import { KPI, KPIFrequency } from '../types';

export const kpisApi = {
  getAll: async (): Promise<KPI[]> => {
    const response = await api.get<KPI[]>('/kpis');
    return response.data;
  },

  getById: async (id: string): Promise<KPI> => {
    const response = await api.get<KPI>(`/kpis/${id}`);
    return response.data;
  },

  getByAnnualGoal: async (annualGoalId: string): Promise<KPI[]> => {
    const response = await api.get<KPI[]>(`/kpis/annual/${annualGoalId}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    annualGoalId: string;
    mboGoalId?: string;
    unit: string;
    targetValue: number;
    currentValue?: number;
    formula?: string;
    frequency: KPIFrequency;
  }): Promise<KPI> => {
    const response = await api.post<KPI>('/kpis', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      unit: string;
      targetValue: number;
      currentValue: number;
      formula: string;
      frequency: KPIFrequency;
    }>
  ): Promise<KPI> => {
    const response = await api.put<KPI>(`/kpis/${id}`, data);
    return response.data;
  },

  updateValue: async (id: string, currentValue: number): Promise<KPI> => {
    const response = await api.patch<KPI>(`/kpis/${id}/value`, { currentValue });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/kpis/${id}`);
  },
};

