import api from './client';
import { Task, Comment } from '../types';

export interface TaskFilters {
  assignedTo?: string;
  status?: string;
  priority?: string;
  search?: string;
  annualGoalId?: string;
  mboGoalId?: string;
}

export const tasksApi = {
  getAll: async (filters?: TaskFilters): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.annualGoalId) params.append('annualGoalId', filters.annualGoalId);
    if (filters?.mboGoalId) params.append('mboGoalId', filters.mboGoalId);

    const response = await api.get<Task[]>(`/tasks?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Task> => {
    const response = await api.post<Task>('/tasks', task);
    return response.data;
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, updates);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  addComment: async (taskId: string, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },
};

