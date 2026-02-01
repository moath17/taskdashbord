import api from './client';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  organizationName: string;
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  setupAdmin: async (options: { useSameAsOwner: true } | { useSameAsOwner: false; adminEmail: string; adminName: string }) => {
    const response = await api.post<{ success: boolean; ownerAlsoAdmin?: boolean; user?: User; adminCreated?: boolean; inviteLink?: string }>(
      '/auth/setup-admin',
      options
    );
    return response.data;
  },
};

