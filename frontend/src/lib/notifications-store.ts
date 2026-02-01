/**
 * Notifications storage - file-based for development (works without Supabase)
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

export type NotificationType =
  | 'task_created'
  | 'task_updated'
  | 'task_status_changed'
  | 'goal_created'
  | 'goal_updated'
  | 'kpi_created'
  | 'kpi_updated'
  | 'plan_approved'
  | 'plan_rejected';

export interface Notification {
  id: string;
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface NotificationsData {
  notifications: Notification[];
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function load(): NotificationsData {
  ensureDir();
  try {
    const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { notifications: [] };
  }
}

function save(data: NotificationsData) {
  ensureDir();
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId() {
  return crypto.randomUUID();
}

export function createNotification(params: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
  const data = load();
  const notification: Notification = {
    ...params,
    id: generateId(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  data.notifications.push(notification);
  save(data);
  return notification;
}

export function createNotificationForUsers(
  userIds: string[],
  params: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>
): void {
  userIds.forEach((userId) => {
    createNotification({ ...params, userId });
  });
}

export function getNotificationsByUser(userId: string, organizationId: string, limit = 50): Notification[] {
  const data = load();
  return data.notifications
    .filter((n) => n.userId === userId && n.organizationId === organizationId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function markAsRead(notificationId: string, userId: string): boolean {
  const data = load();
  const n = data.notifications.find((x) => x.id === notificationId && x.userId === userId);
  if (!n) return false;
  n.read = true;
  save(data);
  return true;
}

export function markAllAsRead(userId: string, organizationId: string): number {
  const data = load();
  let count = 0;
  data.notifications.forEach((n) => {
    if (n.userId === userId && n.organizationId === organizationId && !n.read) {
      n.read = true;
      count++;
    }
  });
  save(data);
  return count;
}

export function getUnreadCount(userId: string, organizationId: string): number {
  const data = load();
  return data.notifications.filter(
    (n) => n.userId === userId && n.organizationId === organizationId && !n.read
  ).length;
}
