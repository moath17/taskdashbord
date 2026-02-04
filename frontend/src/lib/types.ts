// =============================================
// أنواع البيانات الأساسية
// =============================================

export type UserRole = 'owner' | 'manager' | 'employee';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
  // Virtual field (joined from organization)
  organizationName?: string;
}

export interface InviteToken {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: 'manager' | 'employee';
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
