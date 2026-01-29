import api from './client';
import { CalendarEvent } from '../types';

export const calendarApi = {
  getAll: async (): Promise<CalendarEvent[]> => {
    const response = await api.get<CalendarEvent[]>('/calendar');
    return response.data;
  },

  getById: async (id: string): Promise<CalendarEvent> => {
    const response = await api.get<CalendarEvent>(`/calendar/${id}`);
    return response.data;
  },

  create: async (data: Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> => {
    const response = await api.post<CalendarEvent>('/calendar', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<CalendarEvent, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>>): Promise<CalendarEvent> => {
    const response = await api.put<CalendarEvent>(`/calendar/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/calendar/${id}`);
  },
};

