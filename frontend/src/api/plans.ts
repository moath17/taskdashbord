import api from './client';
import { VacationPlan, TrainingPlan, Comment, PlanStatus } from '../types';

export const plansApi = {
  // Vacation Plans
  getVacations: async (): Promise<VacationPlan[]> => {
    const response = await api.get<VacationPlan[]>('/plans/vacations');
    return response.data;
  },

  getVacationById: async (id: string): Promise<VacationPlan> => {
    const response = await api.get<VacationPlan>(`/plans/vacations/${id}`);
    return response.data;
  },

  createVacation: async (plan: Omit<VacationPlan, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<VacationPlan> => {
    const response = await api.post<VacationPlan>('/plans/vacations', plan);
    return response.data;
  },

  updateVacationStatus: async (id: string, status: PlanStatus): Promise<VacationPlan> => {
    const response = await api.put<VacationPlan>(`/plans/vacations/${id}/status`, { status });
    return response.data;
  },

  addVacationComment: async (id: string, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/plans/vacations/${id}/comments`, { content });
    return response.data;
  },

  // Training Plans
  getTrainings: async (): Promise<TrainingPlan[]> => {
    const response = await api.get<TrainingPlan[]>('/plans/trainings');
    return response.data;
  },

  getTrainingById: async (id: string): Promise<TrainingPlan> => {
    const response = await api.get<TrainingPlan>(`/plans/trainings/${id}`);
    return response.data;
  },

  createTraining: async (plan: Omit<TrainingPlan, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<TrainingPlan> => {
    const response = await api.post<TrainingPlan>('/plans/trainings', plan);
    return response.data;
  },

  updateTrainingStatus: async (id: string, status: PlanStatus): Promise<TrainingPlan> => {
    const response = await api.put<TrainingPlan>(`/plans/trainings/${id}/status`, { status });
    return response.data;
  },

  addTrainingComment: async (id: string, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/plans/trainings/${id}/comments`, { content });
    return response.data;
  },
};

