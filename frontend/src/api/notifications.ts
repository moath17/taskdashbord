import api from './client';

export interface Notification {
  id: string;
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: (limit = 50) =>
    api.get<Notification[]>('/notifications', { params: { limit } }).then((r) => r.data),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications', { params: { count: 'true' } }).then((r) => r.data.count),

  markAllRead: () =>
    api.patch('/notifications', { markAllRead: true }).then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),
};
